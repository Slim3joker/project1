// Abend-Hub - zero-dependency Node server.
// Serves the static frontend from /public and proxies the Notion API so the
// secret token never reaches the browser. Later phases (calendar, Kochkiste)
// hang off the same /api surface.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PUBLIC_DIR = join(__dirname, 'public');

const PORT = Number(process.env.PORT) || 3000;
const NOTION_TOKEN = process.env.NOTION_TOKEN || '';
const NOTION_DB_ID = process.env.NOTION_DB_ID || '';
const NOTION_VERSION = '2022-06-28';

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
    const res = await fetch(`https://api.notion.com/v1${path}`, {
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

async function setTaskStatus(id, statusName) {
  await notion(`/pages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      properties: { [PROP.status]: { status: { name: statusName } } },
    }),
  });
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
    return sendJson(res, 200, {
      ok: true,
      notionConfigured: Boolean(NOTION_TOKEN && NOTION_DB_ID),
    });
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

  // PATCH /api/tasks/:id  { status: "Done" | "Not started" | "In progress" }
  const taskMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)$/);
  if (taskMatch && req.method === 'PATCH') {
    if (!NOTION_TOKEN || !NOTION_DB_ID) {
      return sendJson(res, 503, { ok: false, error: 'Notion ist noch nicht konfiguriert.' });
    }
    try {
      const body = await readBody(req);
      const status = String(body.status || DONE_STATUS);
      await setTaskStatus(decodeURIComponent(taskMatch[1]), status);
      return sendJson(res, 200, { ok: true });
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
