'use strict';

/**
 * Test ohne Framework: startet einen Mock-Whisper, fährt den echten Server
 * hoch, lädt eine Datei hoch und prüft, dass am Ende eine Markdown-Datei im
 * Ausgabeordner liegt. Aufruf: npm test
 */
const assert = require('assert');
const fs = require('fs');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const mock = require('./mock-whisper');

let failures = 0;
async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failures += 1;
    console.error(`  ✗ ${name}\n    ${err.message}`);
  }
}

async function main() {
  const tmp = await fsp.mkdtemp(path.join(os.tmpdir(), 'whispr-test-'));
  const outputDir = path.join(tmp, 'out');
  const { port: whisperPort, server: whisperServer } = await mock.start();

  process.env.DATA_DIR = path.join(tmp, 'data');
  process.env.OUTPUT_DIR = outputDir;
  process.env.WHISPER_URL = `http://127.0.0.1:${whisperPort}`;
  process.env.PORT = '0';
  process.env.TRANSCRIBE_BACKEND = 'local';
  process.env.WHISPER_LANG = 'de';

  console.log('\nmarkdown.js');
  const md = require('../lib/markdown');

  await test('slugify macht Umlaute und Sonderzeichen dateinamen-tauglich', () => {
    assert.strictEqual(md.slugify('Übergabe Gespräch – Müller & Co.'), 'uebergabe-gespraech-mueller-co');
    assert.strictEqual(md.slugify('  '), 'transkript');
    assert.strictEqual(md.slugify('../../etc/passwd'), 'etc-passwd');
  });

  await test('formatTime schaltet ab einer Stunde auf h:mm:ss um', () => {
    assert.strictEqual(md.formatTime(65), '1:05');
    assert.strictEqual(md.formatTime(3725), '1:02:05');
  });

  await test('toParagraphs trennt bei langer Sprechpause', () => {
    const paragraphs = md.toParagraphs([
      { start: 0, end: 2, text: 'Erster Satz.' },
      { start: 2.1, end: 4, text: 'Noch im selben Absatz.' },
      { start: 12, end: 14, text: 'Neuer Gedanke.' },
    ]);
    assert.strictEqual(paragraphs.length, 2);
    assert.match(paragraphs[0], /Erster Satz\. Noch im selben Absatz\./);
  });

  await test('buildMarkdown erzeugt gültiges Frontmatter mit escapten Anführungszeichen', () => {
    const out = md.buildMarkdown({
      title: 'Ein "wichtiges" Gespräch',
      sourceFile: 'aufnahme.m4a',
      language: 'de',
      model: 'whisper',
      backend: 'local',
      duration: 95,
      createdAt: '2026-08-07T10:00:00.000Z',
      tags: ['meeting', 'kunde'],
      segments: [{ start: 0, end: 3, text: 'Guten Morgen.' }],
    });
    assert.match(out, /^---\n/);
    assert.match(out, /titel: "Ein \\"wichtiges\\" Gespräch"/);
    assert.match(out, /dauer: "1:35"/);
    assert.match(out, /tags: \["meeting", "kunde"\]/);
    assert.match(out, /## Mit Zeitmarken/);
    assert.match(out, /- \*\*\[0:00\]\*\* Guten Morgen\./);
  });

  console.log('\nserver.js (End-to-End)');
  const { main: bootstrap, store } = require('../server');
  const server = await bootstrap();
  const base = `http://127.0.0.1:${server.address().port}`;

  await test('/api/health meldet ein erreichbares Backend und beschreibbaren Ausgabeordner', async () => {
    const health = await (await fetch(`${base}/api/health`)).json();
    assert.strictEqual(health.backend.ok, true, JSON.stringify(health.backend));
    assert.strictEqual(health.outputWritable, true);
  });

  await test('Pfad-Traversal im Transkript-Endpunkt wird abgewiesen', async () => {
    const res = await fetch(`${base}/api/transcripts/${encodeURIComponent('../../../etc/passwd')}`);
    assert.ok(res.status === 400 || res.status === 404, `Status war ${res.status}`);
  });

  await test('Unerlaubte Dateitypen werden abgelehnt', async () => {
    const form = new FormData();
    form.append('files', new Blob(['nein'], { type: 'application/x-msdownload' }), 'virus.exe');
    const res = await fetch(`${base}/api/upload`, { method: 'POST', body: form });
    assert.strictEqual(res.status, 400);
  });

  let outputFile = null;
  await test('Upload → Transkription → Markdown im Ausgabeordner', async () => {
    const form = new FormData();
    form.append('files', new Blob([Buffer.alloc(2048, 7)], { type: 'audio/mpeg' }), 'Team Meeting.mp3');
    form.append('title', 'Team Meeting');
    form.append('tags', 'meeting, test');
    form.append('notes', 'Kurzer Testlauf');
    form.append('language', 'de');

    const res = await fetch(`${base}/api/upload`, { method: 'POST', body: form });
    const data = await res.json();
    assert.strictEqual(data.ok, true, JSON.stringify(data));
    const jobId = data.jobs[0].id;

    const deadline = Date.now() + 15000;
    let job;
    do {
      await new Promise((r) => setTimeout(r, 150));
      job = await (await fetch(`${base}/api/jobs/${jobId}`)).json();
    } while (job.status !== 'done' && job.status !== 'error' && Date.now() < deadline);

    assert.strictEqual(job.status, 'done', `Job endete als "${job.status}": ${job.error}`);
    outputFile = job.outputFile;
    assert.match(outputFile, /^\d{4}-\d{2}-\d{2}_team-meeting\.md$/);

    const content = await fsp.readFile(path.join(outputDir, outputFile), 'utf-8');
    assert.match(content, /titel: "Team Meeting"/);
    assert.match(content, /quelle: "Team Meeting\.mp3"/);
    assert.match(content, /tags: \["meeting", "test"\]/);
    assert.match(content, /> Kurzer Testlauf/);
    assert.match(content, /Hallo, das ist ein Test\./);
    assert.match(content, /## Mit Zeitmarken/);
  });

  await test('Original-Audio wird nach erfolgreicher Transkription aufgeräumt', async () => {
    const leftovers = await fsp.readdir(path.join(tmp, 'data', 'incoming'));
    assert.strictEqual(leftovers.length, 0, `übrig: ${leftovers.join(', ')}`);
  });

  await test('/api/transcripts listet die Datei und liefert sie aus', async () => {
    const files = await (await fetch(`${base}/api/transcripts`)).json();
    assert.ok(files.some((f) => f.name === outputFile), 'Datei fehlt in der Liste');
    const res = await fetch(`${base}/api/transcripts/${encodeURIComponent(outputFile)}`);
    assert.strictEqual(res.status, 200);
    assert.match(await res.text(), /## Transkript/);
  });

  await test('Zweiter Upload mit gleichem Titel kollidiert nicht', async () => {
    const form = new FormData();
    form.append('files', new Blob([Buffer.alloc(1024, 3)], { type: 'audio/mpeg' }), 'Team Meeting.mp3');
    form.append('title', 'Team Meeting');
    const res = await fetch(`${base}/api/upload`, { method: 'POST', body: form });
    const jobId = (await res.json()).jobs[0].id;
    const deadline = Date.now() + 15000;
    let job;
    do {
      await new Promise((r) => setTimeout(r, 150));
      job = await (await fetch(`${base}/api/jobs/${jobId}`)).json();
    } while (job.status !== 'done' && job.status !== 'error' && Date.now() < deadline);
    assert.strictEqual(job.status, 'done', job.error || '');
    assert.match(job.outputFile, /-2\.md$/);
  });

  await test('Job-Liste überlebt einen Neustart (jobs.json)', async () => {
    await store.flush();
    const persisted = JSON.parse(await fsp.readFile(path.join(tmp, 'data', 'jobs.json'), 'utf-8'));
    assert.ok(persisted.length >= 2, 'Jobs wurden nicht gespeichert');
    assert.ok(persisted.every((j) => j.id && j.status));
  });

  server.close();
  whisperServer.close();
  await fsp.rm(tmp, { recursive: true, force: true });

  console.log(failures ? `\n${failures} Test(s) fehlgeschlagen.\n` : '\nAlle Tests bestanden.\n');
  process.exit(failures ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
