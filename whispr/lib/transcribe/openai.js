'use strict';

const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { fileBlob } = require('./blob');
const { hasFfmpeg, compressToOpus, splitByTime, probeDuration } = require('../audio');

// Die OpenAI-Audio-API nimmt maximal 25 MB pro Anfrage.
const API_LIMIT = 25 * 1024 * 1024;
const SAFE_LIMIT = 23 * 1024 * 1024;
const CHUNK_SECONDS = 600; // 10 Minuten pro Stück

async function callApi(filePath, { baseUrl, apiKey, model, language, signal }) {
  const form = new FormData();
  form.append('file', await fileBlob(filePath), path.basename(filePath));
  form.append('model', model);
  form.append('response_format', 'verbose_json');
  if (language && language !== 'auto') form.append('language', language);

  const res = await fetch(`${baseUrl}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
    signal,
  });

  if (!res.ok) {
    const body = (await res.text().catch(() => '')).slice(0, 400);
    throw new Error(`Transkriptions-API antwortete mit HTTP ${res.status}: ${body}`);
  }

  const data = await res.json();
  const segments = Array.isArray(data.segments)
    ? data.segments.map((s) => ({ start: Number(s.start) || 0, end: Number(s.end) || 0, text: String(s.text || '') }))
    : [];
  return { text: String(data.text || '').trim(), segments, language: data.language || language || '', duration: data.duration };
}

/**
 * Backend "openai": nutzt eine OpenAI-kompatible /audio/transcriptions-API.
 * Große Dateien werden vorher auf mono/16 kHz Opus eingedampft und – falls
 * dann immer noch zu groß – in 10-Minuten-Stücke geschnitten, deren
 * Zeitmarken anschließend wieder zusammengeschoben werden.
 */
async function transcribeOpenAI(filePath, opts) {
  const { openaiBaseUrl, openaiKey, openaiModel, language, signal, onProgress } = opts;
  if (!openaiKey) throw new Error('OPENAI_API_KEY ist nicht gesetzt.');

  const api = { baseUrl: openaiBaseUrl, apiKey: openaiKey, model: openaiModel, language, signal };
  const stat = await fsp.stat(filePath);
  let workFile = filePath;
  let tmpDir = null;

  try {
    if (stat.size > SAFE_LIMIT) {
      if (!(await hasFfmpeg())) {
        throw new Error(
          `Datei ist ${(stat.size / 1024 / 1024).toFixed(1)} MB, die API erlaubt ${API_LIMIT / 1024 / 1024} MB. ` +
            'Für automatisches Verkleinern/Teilen wird ffmpeg benötigt – im Docker-Image ist es enthalten.'
        );
      }
      tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'whispr-'));
      if (onProgress) onProgress('Audio wird für den Upload verkleinert …');
      workFile = await compressToOpus(filePath, path.join(tmpDir, 'audio.ogg'));
    }

    const workStat = await fsp.stat(workFile);
    if (workStat.size <= SAFE_LIMIT) {
      if (onProgress) onProgress('Transkription läuft …');
      return { ...(await callApi(workFile, api)), model: openaiModel };
    }

    // Immer noch zu groß -> in Stücke schneiden.
    if (onProgress) onProgress('Lange Aufnahme – wird in Abschnitte geteilt …');
    const partsDir = path.join(tmpDir || (tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'whispr-'))), 'parts');
    const parts = await splitByTime(workFile, CHUNK_SECONDS, partsDir);
    if (!parts.length) throw new Error('Audio konnte nicht in Abschnitte geteilt werden.');

    const allSegments = [];
    const texts = [];
    let offset = 0;
    let detectedLanguage = '';

    for (let i = 0; i < parts.length; i += 1) {
      if (onProgress) onProgress(`Transkription läuft … Abschnitt ${i + 1} von ${parts.length}`);
      const result = await callApi(parts[i], api);
      detectedLanguage = detectedLanguage || result.language;
      texts.push(result.text);
      for (const seg of result.segments) {
        allSegments.push({ start: seg.start + offset, end: seg.end + offset, text: seg.text });
      }
      const partDuration =
        result.duration ||
        (result.segments.length ? result.segments[result.segments.length - 1].end : null) ||
        (await probeDuration(parts[i])) ||
        CHUNK_SECONDS;
      offset += partDuration;
    }

    return {
      text: texts.join(' ').trim(),
      segments: allSegments,
      language: detectedLanguage || language || '',
      model: openaiModel,
    };
  } finally {
    if (tmpDir) await fsp.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

module.exports = { transcribeOpenAI };
