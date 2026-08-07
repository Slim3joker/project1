'use strict';

const path = require('path');

function bool(value, fallback) {
  if (value === undefined || value === '') return fallback;
  return /^(1|true|yes|ja|on)$/i.test(String(value));
}

function int(value, fallback, min) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return min !== undefined ? Math.max(min, n) : n;
}

const root = path.join(__dirname, '..');

const config = {
  port: int(process.env.PORT, 8098),

  // Arbeitsverzeichnis: Job-Datenbank + hochgeladene Audios vor der Transkription
  dataDir: process.env.DATA_DIR || path.join(root, 'data'),
  // Hier landen die fertigen .md-Dateien (auf Unraid: ein gemounteter Share)
  outputDir: process.env.OUTPUT_DIR || path.join(root, 'transkripte'),
  // Optional: Original-Audio nach der Transkription hierhin verschieben statt löschen
  audioArchiveDir: process.env.AUDIO_ARCHIVE_DIR || '',

  backend: (process.env.TRANSCRIBE_BACKEND || 'local').toLowerCase(),

  // Backend "local": onerahmet/openai-whisper-asr-webservice
  whisperUrl: (process.env.WHISPER_URL || 'http://127.0.0.1:9000').replace(/\/+$/, ''),

  // Backend "openai": OpenAI-kompatible /audio/transcriptions-API
  openaiBaseUrl: (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, ''),
  openaiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'whisper-1',

  language: process.env.WHISPER_LANG || 'de',
  concurrency: int(process.env.CONCURRENCY, 1, 1),
  maxUploadMb: int(process.env.MAX_UPLOAD_MB, 500, 1),
  jobTimeoutMin: int(process.env.JOB_TIMEOUT_MIN, 120, 1),
  timestamps: bool(process.env.TIMESTAMPS, true),

  // Optionaler Zugriffsschutz (wichtig, wenn die App über einen Tunnel erreichbar ist)
  authToken: process.env.AUTH_TOKEN || '',
};

config.maxUploadBytes = config.maxUploadMb * 1024 * 1024;
config.incomingDir = path.join(config.dataDir, 'incoming');
config.jobsFile = path.join(config.dataDir, 'jobs.json');

module.exports = config;
