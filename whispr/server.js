'use strict';

const crypto = require('crypto');
const express = require('express');
const fs = require('fs');
const fsp = require('fs/promises');
const multer = require('multer');
const path = require('path');

const config = require('./lib/config');
const { JobStore } = require('./lib/store');
const { Queue } = require('./lib/queue');
const { transcribe, checkBackend } = require('./lib/transcribe');
const { buildMarkdown, slugify } = require('./lib/markdown');
const { probeDuration } = require('./lib/audio');

const ALLOWED_EXT = new Set([
  '.mp3', '.mp4', '.m4a', '.m4b', '.wav', '.ogg', '.oga', '.opus',
  '.flac', '.aac', '.webm', '.wma', '.mkv', '.mov', '.amr', '.3gp', '.aiff', '.aif',
]);

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);

const store = new JobStore(config.jobsFile);
const controllers = new Map(); // jobId -> AbortController

// ---------------------------------------------------------------- Dateien ---

async function ensureDirs() {
  for (const dir of [config.dataDir, config.incomingDir, config.outputDir]) {
    await fsp.mkdir(dir, { recursive: true });
  }
  if (config.audioArchiveDir) await fsp.mkdir(config.audioArchiveDir, { recursive: true });
}

/**
 * Schreibt das Markdown unter `2026-08-07_titel.md`, bei Namenskollision unter
 * `-2`, `-3` … Das exklusive Anlegen ("wx") erledigt Prüfen und Anlegen in
 * einem Schritt – so überschreiben zwei gleichzeitig fertige Jobs sich nicht.
 */
async function writeMarkdownUnique(baseName, content) {
  for (let i = 1; i < 500; i += 1) {
    const name = i === 1 ? `${baseName}.md` : `${baseName}-${i}.md`;
    let handle;
    try {
      handle = await fsp.open(path.join(config.outputDir, name), 'wx');
    } catch (err) {
      if (err.code === 'EEXIST') continue;
      throw err;
    }
    try {
      await handle.writeFile(content, 'utf-8');
    } finally {
      await handle.close();
    }
    return name;
  }
  throw new Error('Kein freier Dateiname im Ausgabeordner gefunden.');
}

/** Schützt vor `../` in Dateinamen aus der URL. */
function safeName(name) {
  const base = path.basename(String(name || ''));
  if (!base || base === '.' || base === '..') return null;
  return base;
}

// ------------------------------------------------------------------- Jobs ---

async function processJob(jobId) {
  const job = store.get(jobId);
  if (!job || job.status === 'canceled') return;

  const controller = new AbortController();
  controllers.set(jobId, controller);
  const timeout = setTimeout(() => controller.abort(), config.jobTimeoutMin * 60 * 1000);

  store.update(jobId, {
    status: 'running',
    startedAt: new Date().toISOString(),
    progress: 'Transkription wird vorbereitet …',
    error: null,
  });

  try {
    const audioPath = path.join(config.incomingDir, job.storedName);
    try {
      await fsp.access(audioPath);
    } catch {
      throw new Error('Die hochgeladene Audiodatei ist nicht mehr da – bitte neu hochladen.');
    }

    const result = await transcribe(audioPath, {
      backend: config.backend,
      whisperUrl: config.whisperUrl,
      openaiBaseUrl: config.openaiBaseUrl,
      openaiKey: config.openaiKey,
      openaiModel: config.openaiModel,
      language: job.language || config.language,
      signal: controller.signal,
      onProgress: (text) => store.update(jobId, { progress: text }),
    });

    if (!result.text && !(result.segments && result.segments.length)) {
      throw new Error('Whisper hat keinen Text erkannt. Enthält die Datei überhaupt Sprache?');
    }

    store.update(jobId, { progress: 'Markdown wird geschrieben …' });

    const duration =
      (result.segments && result.segments.length
        ? result.segments[result.segments.length - 1].end
        : null) ?? (await probeDuration(audioPath));

    const createdAt = new Date().toISOString();
    const markdown = buildMarkdown(
      {
        title: job.title,
        sourceFile: job.originalName,
        language: result.language,
        model: result.model,
        backend: config.backend,
        duration,
        createdAt,
        tags: job.tags,
        notes: job.notes,
        segments: result.segments,
        text: result.text,
      },
      { timestamps: config.timestamps }
    );

    const datePart = createdAt.slice(0, 10);
    const outputName = await writeMarkdownUnique(`${datePart}_${slugify(job.title)}`, markdown);

    // Original-Audio: archivieren oder aufräumen.
    if (config.audioArchiveDir) {
      const target = path.join(config.audioArchiveDir, job.storedName);
      await fsp.rename(audioPath, target).catch(async () => {
        await fsp.copyFile(audioPath, target);
        await fsp.unlink(audioPath);
      });
    } else {
      await fsp.unlink(audioPath).catch(() => {});
    }

    store.update(jobId, {
      status: 'done',
      progress: 'Fertig',
      finishedAt: createdAt,
      outputFile: outputName,
      duration,
      detectedLanguage: result.language,
      model: result.model,
      characters: markdown.length,
    });
    console.log(`[job ${jobId}] fertig -> ${outputName}`);
  } catch (err) {
    const canceled = controller.signal.aborted && store.get(jobId)?.status === 'canceled';
    const timedOut = controller.signal.aborted && !canceled;
    const message = canceled
      ? 'Abgebrochen.'
      : timedOut
        ? `Zeitlimit von ${config.jobTimeoutMin} Minuten überschritten.`
        : err.message || String(err);
    store.update(jobId, {
      status: canceled ? 'canceled' : 'error',
      progress: canceled ? 'Abgebrochen' : 'Fehler',
      error: message,
      finishedAt: new Date().toISOString(),
    });
    console.error(`[job ${jobId}] ${message}`);
  } finally {
    clearTimeout(timeout);
    controllers.delete(jobId);
  }
}

const queue = new Queue(config.concurrency, processJob);

function enqueue(job) {
  store.put(job);
  queue.push(job.id);
  return job;
}

// ------------------------------------------------------------------- Auth ---

function parseCookies(header) {
  const out = {};
  for (const part of String(header || '').split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

function tokenMatches(candidate) {
  if (!config.authToken) return true;
  const a = Buffer.from(String(candidate || ''));
  const b = Buffer.from(config.authToken);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

app.use(express.json({ limit: '1mb' }));

app.post('/api/login', (req, res) => {
  if (!config.authToken) return res.json({ ok: true });
  if (!tokenMatches(req.body && req.body.token)) {
    return res.status(401).json({ ok: false, error: 'Falsches Passwort.' });
  }
  res.setHeader(
    'Set-Cookie',
    `whispr_token=${encodeURIComponent(config.authToken)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 90}`
  );
  res.json({ ok: true });
});

app.use((req, res, next) => {
  if (!config.authToken) return next();
  const cookies = parseCookies(req.headers.cookie);
  const supplied = req.headers['x-auth-token'] || cookies.whispr_token;
  if (tokenMatches(supplied)) return next();
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ ok: false, error: 'Nicht angemeldet.', needsAuth: true });
  }
  return next(); // Die Oberfläche lädt und zeigt selbst den Login-Dialog.
});

// ---------------------------------------------------------------- Uploads ---

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.incomingDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
    cb(null, `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxUploadBytes, files: 20 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXT.has(ext) || /^(audio|video)\//.test(file.mimetype)) return cb(null, true);
    cb(new Error(`Dateityp "${ext || file.mimetype}" wird nicht unterstützt.`));
  },
});

app.post('/api/upload', (req, res) => {
  upload.array('files', 20)(req, res, async (err) => {
    if (err) {
      // Bereits abgelegte Dateien der abgebrochenen Anfrage wegräumen.
      for (const file of req.files || []) {
        await fsp.unlink(file.path).catch(() => {});
      }
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? `Datei zu groß (max. ${config.maxUploadMb} MB).`
          : err.code === 'LIMIT_FILE_COUNT'
            ? 'Maximal 20 Dateien pro Upload.'
            : err.message || 'Upload fehlgeschlagen.';
      return res.status(400).json({ ok: false, error: message });
    }
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ ok: false, error: 'Keine Datei empfangen.' });

    const body = req.body || {};
    const tags = String(body.tags || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const language = String(body.language || '').trim() || config.language;
    const notes = String(body.notes || '').trim();
    const titleInput = String(body.title || '').trim();

    const jobs = files.map((file, index) => {
      const fallbackTitle = path.basename(file.originalname, path.extname(file.originalname)).replace(/[_]+/g, ' ');
      const title = titleInput
        ? files.length > 1
          ? `${titleInput} (${index + 1})`
          : titleInput
        : fallbackTitle;
      return enqueue({
        id: `${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}${index}`,
        status: 'queued',
        progress: 'Wartet …',
        createdAt: new Date().toISOString(),
        originalName: file.originalname,
        storedName: file.filename,
        size: file.size,
        title,
        tags,
        notes,
        language,
        outputFile: null,
        error: null,
      });
    });

    res.json({ ok: true, jobs: jobs.map((j) => ({ id: j.id, title: j.title })) });
  });
});

// -------------------------------------------------------------------- API ---

app.get('/api/config', async (req, res) => {
  res.json({
    maxUploadMb: config.maxUploadMb,
    backend: config.backend,
    language: config.language,
    outputDir: config.outputDir,
    timestamps: config.timestamps,
    authRequired: Boolean(config.authToken),
  });
});

app.get('/api/health', async (req, res) => {
  const backend = await checkBackend(config);
  let outputWritable = true;
  try {
    const probe = path.join(config.outputDir, '.whispr-write-test');
    await fsp.writeFile(probe, 'ok');
    await fsp.unlink(probe);
  } catch {
    outputWritable = false;
  }
  res.json({
    backend: { name: config.backend, ...backend },
    outputDir: config.outputDir,
    outputWritable,
    queued: queue.size,
    running: store.list().filter((j) => j.status === 'running').length,
  });
});

app.get('/api/jobs', (req, res) => {
  res.json(store.list());
});

app.get('/api/jobs/:id', (req, res) => {
  const job = store.get(req.params.id);
  if (!job) return res.status(404).json({ ok: false, error: 'Job nicht gefunden.' });
  res.json(job);
});

app.post('/api/jobs/:id/cancel', (req, res) => {
  const job = store.get(req.params.id);
  if (!job) return res.status(404).json({ ok: false, error: 'Job nicht gefunden.' });
  if (job.status !== 'queued' && job.status !== 'running') {
    return res.status(400).json({ ok: false, error: 'Job läuft nicht mehr.' });
  }
  queue.cancelPending((id) => id === job.id);
  store.update(job.id, { status: 'canceled', progress: 'Abgebrochen', finishedAt: new Date().toISOString() });
  const controller = controllers.get(job.id);
  if (controller) controller.abort();
  res.json({ ok: true });
});

app.post('/api/jobs/:id/retry', async (req, res) => {
  const job = store.get(req.params.id);
  if (!job) return res.status(404).json({ ok: false, error: 'Job nicht gefunden.' });
  try {
    await fsp.access(path.join(config.incomingDir, job.storedName));
  } catch {
    return res
      .status(400)
      .json({ ok: false, error: 'Die Audiodatei wurde bereits aufgeräumt – bitte neu hochladen.' });
  }
  store.update(job.id, { status: 'queued', progress: 'Wartet …', error: null, finishedAt: null });
  queue.push(job.id);
  res.json({ ok: true });
});

app.delete('/api/jobs/:id', async (req, res) => {
  const job = store.get(req.params.id);
  if (!job) return res.status(404).json({ ok: false, error: 'Job nicht gefunden.' });
  if (job.status === 'running') return res.status(400).json({ ok: false, error: 'Job läuft noch.' });
  if (job.storedName) {
    await fsp.unlink(path.join(config.incomingDir, job.storedName)).catch(() => {});
  }
  store.remove(job.id);
  res.json({ ok: true });
});

/** Fertige Markdown-Dateien im Ausgabeordner (überlebt auch das Löschen von Jobs). */
app.get('/api/transcripts', async (req, res) => {
  try {
    const entries = await fsp.readdir(config.outputDir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
      const stat = await fsp.stat(path.join(config.outputDir, entry.name));
      files.push({ name: entry.name, size: stat.size, modified: stat.mtime.toISOString() });
    }
    files.sort((a, b) => new Date(b.modified) - new Date(a.modified));
    res.json(files);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/transcripts/:name', async (req, res) => {
  const name = safeName(req.params.name);
  if (!name || !name.endsWith('.md')) return res.status(400).json({ ok: false, error: 'Ungültiger Name.' });
  try {
    const content = await fsp.readFile(path.join(config.outputDir, name), 'utf-8');
    if (req.query.download) {
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(name)}"`);
    }
    res.type('text/markdown; charset=utf-8').send(content);
  } catch {
    res.status(404).json({ ok: false, error: 'Datei nicht gefunden.' });
  }
});

app.delete('/api/transcripts/:name', async (req, res) => {
  const name = safeName(req.params.name);
  if (!name || !name.endsWith('.md')) return res.status(400).json({ ok: false, error: 'Ungültiger Name.' });
  try {
    await fsp.unlink(path.join(config.outputDir, name));
    res.json({ ok: true });
  } catch {
    res.status(404).json({ ok: false, error: 'Datei nicht gefunden.' });
  }
});

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

// ------------------------------------------------------------------ Start ---

async function main() {
  await ensureDirs();
  store.load();

  // Verwaiste Jobs aus einem harten Neustart wieder einreihen, wenn das Audio noch da ist.
  for (const job of store.list()) {
    if (job.status === 'error' && job.storedName && /neu gestartet/.test(job.error || '')) {
      if (fs.existsSync(path.join(config.incomingDir, job.storedName))) {
        store.update(job.id, { status: 'queued', progress: 'Wartet … (nach Neustart)', error: null });
        queue.push(job.id);
      }
    }
  }

  return new Promise((resolve) => {
    const server = app.listen(config.port, '0.0.0.0', () => {
      console.log('');
      console.log('  🎙️  Whispr – Audio → Markdown');
      console.log(`     Port:      ${server.address().port}`);
      console.log(`     Backend:   ${config.backend}${config.backend === 'local' ? ` (${config.whisperUrl})` : ` (${config.openaiModel})`}`);
      console.log(`     Sprache:   ${config.language}`);
      console.log(`     Ausgabe:   ${config.outputDir}`);
      console.log(`     Audio:     ${config.audioArchiveDir || 'wird nach der Transkription gelöscht'}`);
      console.log(`     Schutz:    ${config.authToken ? 'Passwort aktiv' : 'offen (kein AUTH_TOKEN gesetzt)'}`);
      console.log('');
      resolve(server);
    });
  });
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Start fehlgeschlagen:', err);
    process.exit(1);
  });
}

module.exports = { app, main, store, queue };
