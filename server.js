// Abend-Hub - zero-dependency Node server.
// Serves the static frontend from /public and proxies the Notion API so the
// secret token never reaches the browser. Later phases (calendar, Kochkiste)
// hang off the same /api surface.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eventsFromICS } from './ical.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PUBLIC_DIR = join(__dirname, 'public');

const PORT = Number(process.env.PORT) || 3000;
const NOTION_TOKEN = process.env.NOTION_TOKEN || '';
const NOTION_DB_ID = process.env.NOTION_DB_ID || '';
const NOTION_VERSION = '2022-06-28';
const NOTION_API = process.env.NOTION_API_BASE || 'https://api.notion.com/v1';

// Phase 2: geheime iCal-URL des Google-Kalenders (nur lesen, serverseitig).
const GOOGLE_ICAL_URL = process.env.GOOGLE_ICAL_URL || '';
const CAL_DAYS = Number(process.env.CAL_DAYS) || 14;

// --- Notion property names (must match the Abend-Tasks database exactly) ----
const PROP = {
  title: 'Aufgabe',
  bereich: 'Bereich',
  prioritaet: 'Priorität',
  status: 'Status',
  faellig: 'Fällig',
};
const DONE_STATUS = 'Done';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(payload);
}

// --- Notion helpers ---------------------------------------------------------
async function notion(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(`${NOTION_API}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = data?.message || `Notion API ${res.status}`;
      const err = new Error(message);
      err.status = res.status;
      throw err;
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

function plainTitle(prop) {
  if (!prop || !Array.isArray(prop.title)) return '';
  return prop.title.map((t) => t.plain_text).join('').trim();
}

function mapPage(page) {
  const p = page.properties || {};
  return {
    id: page.id,
    title: plainTitle(p[PROP.title]) || '(ohne Titel)',
    bereich: p[PROP.bereich]?.select?.name || null,
    prioritaet: p[PROP.prioritaet]?.select?.name || null,
    status: p[PROP.status]?.status?.name || null,
    faellig: p[PROP.faellig]?.date?.start || null,
    createdTime: page.created_time || null,
    url: page.url || null,
  };
}

async function fetchTasks() {
  const results = [];
  let cursor;
  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const data = await notion(`/databases/${NOTION_DB_ID}/query`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    results.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return results.map(mapPage);
}

// Baut das Notion-"properties"-Objekt aus einfachen Feldern.
// Nur uebergebene Schluessel werden gesetzt (Teil-Updates moeglich).
function buildProps(fields) {
  const props = {};
  if (typeof fields.title === 'string') {
    props[PROP.title] = { title: [{ text: { content: fields.title } }] };
  }
  if ('bereich' in fields) {
    props[PROP.bereich] = { select: fields.bereich ? { name: fields.bereich } : null };
  }
  if ('prioritaet' in fields) {
    props[PROP.prioritaet] = { select: fields.prioritaet ? { name: fields.prioritaet } : null };
  }
  if ('faellig' in fields) {
    props[PROP.faellig] = { date: fields.faellig ? { start: fields.faellig } : null };
  }
  if ('status' in fields && fields.status) {
    props[PROP.status] = { status: { name: fields.status } };
  }
  return props;
}

async function createTask(fields) {
  const data = await notion('/pages', {
    method: 'POST',
    body: JSON.stringify({
      parent: { database_id: NOTION_DB_ID },
      properties: buildProps(fields),
    }),
  });
  return mapPage(data);
}

async function updateTask(id, fields) {
  const data = await notion(`/pages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ properties: buildProps(fields) }),
  });
  return mapPage(data);
}

async function archiveTask(id) {
  await notion(`/pages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ archived: true }),
  });
}

// --- Kalender (iCal) --------------------------------------------------------
const calCache = { at: 0, events: null };
const CAL_TTL_MS = 5 * 60 * 1000; // 5 Min. Cache, damit Google nicht gehaemmert wird

async function fetchCalendar() {
  const now = Date.now();
  if (calCache.events && now - calCache.at < CAL_TTL_MS) return calCache.events;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(GOOGLE_ICAL_URL, {
      signal: controller.signal,
      headers: { 'User-Agent': 'abend-hub' },
    });
    if (!res.ok) {
      const err = new Error(`Kalender-Feed HTTP ${res.status}`);
      err.status = 502;
      throw err;
    }
    const text = await res.text();
    const events = eventsFromICS(text, { days: CAL_DAYS });
    calCache.at = now;
    calCache.events = events;
    return events;
  } finally {
    clearTimeout(timeout);
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) reject(new Error('Body too large'));
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Ungueltiges JSON'));
      }
    });
    req.on('error', reject);
  });
}

// --- Static files -----------------------------------------------------------
async function serveStatic(req, res) {
  let pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (pathname === '/') pathname = '/index.html';
  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(PUBLIC_DIR, safePath);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error('not a file');
    const data = await readFile(filePath);
    res.writeHead(200, {
      'content-type': MIME[extname(filePath)] || 'application/octet-stream',
      'cache-control': safePath === '/index.html' ? 'no-cache' : 'public, max-age=3600',
    });
    res.end(data);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Nicht gefunden');
  }
}

// --- Router -----------------------------------------------------------------
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');

  if (url.pathname === '/api/health') {
    const health = {
      ok: true,
      notionConfigured: Boolean(NOTION_TOKEN && NOTION_DB_ID),
      calendarConfigured: Boolean(GOOGLE_ICAL_URL),
      notion: null,
      calendar: null,
    };
    if (health.notionConfigured) {
      try {
        await notion(`/databases/${NOTION_DB_ID}`, { method: 'GET' });
        health.notion = { read: true };
      } catch (err) {
        health.notion = { read: false, status: err.status || null, error: err.message };
      }
    }
    if (health.calendarConfigured) {
      try {
        const events = await fetchCalendar();
        health.calendar = { ok: true, events: events.length };
      } catch (err) {
        health.calendar = { ok: false, error: err.message };
      }
    }
    return sendJson(res, 200, health);
  }

  if (url.pathname === '/api/calendar' && req.method === 'GET') {
    if (!GOOGLE_ICAL_URL) {
      return sendJson(res, 200, { ok: true, configured: false, events: [] });
    }
    try {
      const events = await fetchCalendar();
      return sendJson(res, 200, { ok: true, configured: true, events });
    } catch (err) {
      return sendJson(res, err.status || 502, { ok: false, error: err.message });
    }
  }

  if (url.pathname === '/api/tasks' && req.method === 'GET') {
    if (!NOTION_TOKEN || !NOTION_DB_ID) {
      return sendJson(res, 503, {
        ok: false,
        error: 'Notion ist noch nicht konfiguriert (NOTION_TOKEN / NOTION_DB_ID fehlen).',
      });
    }
    try {
      const tasks = await fetchTasks();
      return sendJson(res, 200, { ok: true, tasks });
    } catch (err) {
      return sendJson(res, err.status || 502, { ok: false, error: err.message });
    }
  }

  // POST /api/tasks  { title, bereich?, prioritaet?, faellig?, status? }
  if (url.pathname === '/api/tasks' && req.method === 'POST') {
    if (!NOTION_TOKEN || !NOTION_DB_ID) {
      return sendJson(res, 503, { ok: false, error: 'Notion ist noch nicht konfiguriert.' });
    }
    try {
      const body = await readBody(req);
      const title = String(body.title || '').trim();
      if (!title) return sendJson(res, 400, { ok: false, error: 'Titel fehlt.' });
      const task = await createTask({
        title,
        bereich: body.bereich || null,
        prioritaet: body.prioritaet || null,
        faellig: body.faellig || null,
        status: body.status || 'Not started',
      });
      return sendJson(res, 201, { ok: true, task });
    } catch (err) {
      return sendJson(res, err.status || 502, { ok: false, error: err.message });
    }
  }

  // /api/tasks/:id  ->  PATCH (aendern)  |  DELETE (archivieren)
  const taskMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)$/);
  if (taskMatch && (req.method === 'PATCH' || req.method === 'DELETE')) {
    if (!NOTION_TOKEN || !NOTION_DB_ID) {
      return sendJson(res, 503, { ok: false, error: 'Notion ist noch nicht konfiguriert.' });
    }
    const id = decodeURIComponent(taskMatch[1]);
    try {
      if (req.method === 'DELETE') {
        await archiveTask(id);
        return sendJson(res, 200, { ok: true });
      }
      const body = await readBody(req);
      const fields = {};
      if ('title' in body) fields.title = String(body.title);
      if ('bereich' in body) fields.bereich = body.bereich || null;
      if ('prioritaet' in body) fields.prioritaet = body.prioritaet || null;
      if ('faellig' in body) fields.faellig = body.faellig || null;
      if ('status' in body) fields.status = body.status;
      const task = await updateTask(id, fields);
      return sendJson(res, 200, { ok: true, task });
    } catch (err) {
      return sendJson(res, err.status || 502, { ok: false, error: err.message });
    }
  }

  if (url.pathname.startsWith('/api/')) {
    return sendJson(res, 404, { ok: false, error: 'Unbekannter Endpunkt' });
  }

  return serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Abend-Hub laeuft auf Port ${PORT}`);
  if (!NOTION_TOKEN || !NOTION_DB_ID) {
    console.warn('Hinweis: NOTION_TOKEN und/oder NOTION_DB_ID fehlen - /api/tasks liefert erst nach dem Setzen der Variablen Daten.');
  }
});
