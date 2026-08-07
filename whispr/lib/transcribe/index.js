'use strict';

const { transcribeLocal } = require('./local');
const { transcribeOpenAI } = require('./openai');

/**
 * Führt die Transkription mit dem konfigurierten Backend durch.
 * Rückgabe: { text, segments[], language, model }
 */
async function transcribe(filePath, opts) {
  const backend = (opts.backend || 'local').toLowerCase();
  if (backend === 'openai') return transcribeOpenAI(filePath, opts);
  if (backend === 'local') return transcribeLocal(filePath, opts);
  throw new Error(`Unbekanntes Backend "${backend}" – erlaubt sind "local" und "openai".`);
}

/** Erreichbarkeit des Backends prüfen (für die Status-Anzeige im Header). */
async function checkBackend(config) {
  if (config.backend === 'openai') {
    if (!config.openaiKey) return { ok: false, detail: 'OPENAI_API_KEY fehlt' };
    return { ok: true, detail: `${config.openaiModel} @ ${new URL(config.openaiBaseUrl).host}` };
  }
  // Je nach Version des ASR-Webservice liegt die Swagger-Oberfläche unter
  // /docs, ältere leiten von / dorthin weiter – beides gilt als "erreichbar".
  let lastStatus = null;
  for (const probePath of ['/docs', '/']) {
    try {
      const res = await fetch(`${config.whisperUrl}${probePath}`, {
        method: 'GET',
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) return { ok: true, detail: config.whisperUrl };
      lastStatus = res.status;
    } catch {
      return { ok: false, detail: `${config.whisperUrl} nicht erreichbar` };
    }
  }
  return { ok: false, detail: `HTTP ${lastStatus} von ${config.whisperUrl}` };
}

module.exports = { transcribe, checkBackend };
