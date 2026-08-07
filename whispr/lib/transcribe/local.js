'use strict';

const path = require('path');
const { fileBlob } = require('./blob');

/**
 * Backend "local": spricht die HTTP-API von
 * onerahmet/openai-whisper-asr-webservice an.
 *
 * Bewusst KEIN `docker run` mehr aus der App heraus – das war der Grund,
 * warum die erste Version nie lief (Docker-Socket, falsche Volume-Pfade,
 * Shell-Escaping). Ein HTTP-POST an den Nachbarcontainer ist stabil,
 * debuggbar und liefert echte Fehlermeldungen.
 */
async function transcribeLocal(filePath, opts) {
  const { whisperUrl, language, signal, onProgress } = opts;

  const params = new URLSearchParams({
    task: 'transcribe',
    output: 'json',
    encode: 'true',
    word_timestamps: 'false',
  });
  if (language && language !== 'auto') params.set('language', language);

  const form = new FormData();
  form.append('audio_file', await fileBlob(filePath), path.basename(filePath));

  if (onProgress) onProgress('Whisper rechnet … (je nach Länge einige Minuten)');

  let res;
  try {
    res = await fetch(`${whisperUrl}/asr?${params.toString()}`, {
      method: 'POST',
      body: form,
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new Error(
      `Whisper-Dienst unter ${whisperUrl} nicht erreichbar (${err.message}). ` +
        'Läuft der Container "whisper" und stimmt WHISPER_URL?'
    );
  }

  if (!res.ok) {
    const body = (await res.text().catch(() => '')).slice(0, 400);
    throw new Error(`Whisper-Dienst antwortete mit HTTP ${res.status}: ${body}`);
  }

  const raw = await res.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    // Manche Versionen liefern bei output=json trotzdem reinen Text.
    return { text: raw.trim(), segments: [], language: language || '', model: 'whisper' };
  }

  const segments = Array.isArray(data.segments)
    ? data.segments.map((s) => ({ start: Number(s.start) || 0, end: Number(s.end) || 0, text: String(s.text || '') }))
    : [];

  return {
    text: String(data.text || segments.map((s) => s.text).join(' ')).trim(),
    segments,
    language: data.language || language || '',
    model: 'whisper (asr-webservice)',
  };
}

module.exports = { transcribeLocal };
