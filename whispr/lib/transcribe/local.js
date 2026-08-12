'use strict';

const path = require('path');
const { fileBlob } = require('./blob');

// undici's interner headersTimeout (Standard: 300 s) bricht Whisper-Anfragen
// ab, bevor unser eigenes Job-Timeout greift – bei langen Dateien auf der CPU
// kommt Whisper einfach nicht in 5 Minuten durch. Ein eigener Dispatcher
// schaltet den Undici-Timeout ab; das JOB_TIMEOUT_MIN in server.js regelt,
// wann ein Job als hängengeblieben gilt.
let noTimeoutAgent;
try {
  const { Agent } = require('undici');
  noTimeoutAgent = new Agent({ headersTimeout: 0, bodyTimeout: 0 });
} catch {
  /* undici nicht direkt verfügbar – Standard-Timeouts greifen */
}

/**
 * Backend "local": spricht die HTTP-API von
 * onerahmet/openai-whisper-asr-webservice an.
 *
 * Bewusst KEIN `docker run` mehr aus der App heraus – das war der Grund,
 * warum die erste Version nie lief (Docker-Socket, falsche Volume-Pfade,
 * Shell-Escaping). Ein HTTP-POST an den Nachbarcontainer ist stabil,
 * debuggbar und liefert echte Fehlermeldungen.
 */
/**
 * `fetch` verpackt jede Verbindungsstörung in ein nichtssagendes
 * "TypeError: fetch failed". Die brauchbare Information liegt eine oder zwei
 * Ebenen tiefer – und mal als `code`, mal nur als Meldung.
 */
function causeCode(err) {
  const cause = err.cause;
  if (cause) {
    if (typeof cause.code === 'string') return cause.code;
    // Bei mehreren Adressen (IPv4/IPv6) sammelt undici die Einzelfehler.
    if (Array.isArray(cause.errors)) {
      const inner = cause.errors.find((e) => typeof e.code === 'string');
      if (inner) return inner.code;
    }
  }
  return (typeof err.code === 'string' && err.code) || '';
}

/**
 * Übersetzt einen Verbindungsfehler in eine Ursache. Ohne das sieht ein
 * abgestürzter Whisper-Container genauso aus wie eine falsche URL, und man
 * sucht den Fehler an der falschen Stelle – genau das kostet sonst Stunden.
 *
 * `kind` ist die maschinenlesbare Fassung: der Selbsttest hängt daran seine
 * weiterführenden Hinweise, statt deutschen Fließtext nach Stichworten zu
 * durchsuchen.
 */
function describeFetchError(err, whisperUrl) {
  const code = causeCode(err);
  const where = `Whisper-Dienst unter ${whisperUrl}`;

  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') {
    return {
      kind: 'dns',
      message: `${where}: Hostname nicht auflösbar. Läuft der Container unter diesem Namen und hängen beide im selben Docker-Netzwerk?`,
    };
  }
  if (code === 'ECONNREFUSED') {
    return {
      kind: 'refused',
      message: `${where}: Verbindung abgelehnt. Der Container läuft nicht (oder nicht auf diesem Port).`,
    };
  }
  if (code === 'ECONNRESET' || code === 'UND_ERR_SOCKET' || code === 'EPIPE') {
    return {
      kind: 'reset',
      message: `${where}: Verbindung mitten in der Anfrage abgebrochen. Das passiert fast immer, wenn der Whisper-Container beim Laden des Modells abgeschossen wird (zu wenig RAM). Kleineres ASR_MODEL probieren – "small" statt "large-v3" – und mit "docker logs whisper" nachsehen.`,
    };
  }
  if (code === 'ETIMEDOUT' || code === 'UND_ERR_CONNECT_TIMEOUT') {
    return {
      kind: 'timeout',
      message: `${where}: Zeitüberschreitung beim Verbinden. Erreichbar, aber keine Antwort – meist eine Firewall oder ein Container, der noch startet.`,
    };
  }
  if (code === 'UND_ERR_HEADERS_TIMEOUT' || code === 'UND_ERR_BODY_TIMEOUT') {
    return {
      kind: 'timeout',
      message: `${where}: Zeitüberschreitung – Whisper rechnet noch. Die Audiodatei ist wahrscheinlich zu lang für das Modell auf der CPU. Mit GPU oder einem kleineren Modell geht es schneller.`,
    };
  }
  return {
    kind: 'unknown',
    message: `${where} nicht erreichbar (${code || err.message}). Läuft der Container "whisper" und stimmt WHISPER_URL?`,
  };
}

/** Verbindungsfehler mit Ursache, so dass Aufrufer daran anknüpfen können. */
function connectionError(err, whisperUrl) {
  const { kind, message } = describeFetchError(err, whisperUrl);
  const out = new Error(message);
  out.kind = kind;
  out.cause = err;
  return out;
}

/** Pause, die auf "Abbrechen" sofort reagiert statt die Zeit abzusitzen. */
function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal && signal.aborted) return reject(signal.reason || new Error('abgebrochen'));
    const timer = setTimeout(done, ms);
    function done() {
      if (signal) signal.removeEventListener('abort', onAbort);
      resolve();
    }
    function onAbort() {
      clearTimeout(timer);
      reject(signal.reason || new Error('abgebrochen'));
    }
    if (signal) signal.addEventListener('abort', onAbort, { once: true });
  });
}

async function transcribeLocal(filePath, opts) {
  const { whisperUrl, language, signal, onProgress } = opts;

  const params = new URLSearchParams({
    task: 'transcribe',
    output: 'json',
    encode: 'true',
    word_timestamps: 'false',
  });
  if (language && language !== 'auto') params.set('language', language);

  if (onProgress) onProgress('Whisper rechnet … (je nach Länge einige Minuten)');

  // Beim allerersten Auftrag lädt der Dienst sein Modell – dabei ist er kurz
  // nicht ansprechbar und kann sogar neu starten. Ein zweiter Versuch nach
  // einer Pause trifft ihn dann warm an. Nur Verbindungsfehler werden
  // wiederholt, keine HTTP-Fehler und kein Abbruch durch den Nutzer.
  const ATTEMPTS = 3;
  let res;
  for (let attempt = 1; ; attempt++) {
    // FormData je Versuch neu aufbauen – ein verbrauchter Body ist nicht
    // wiederverwendbar.
    const form = new FormData();
    form.append('audio_file', await fileBlob(filePath), path.basename(filePath));

    try {
      res = await fetch(`${whisperUrl}/asr?${params.toString()}`, {
        method: 'POST',
        body: form,
        signal,
        ...(noTimeoutAgent ? { dispatcher: noTimeoutAgent } : {}),
      });
      break;
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      if (attempt >= ATTEMPTS) throw connectionError(err, whisperUrl);

      const waitMs = attempt * 15000;
      if (onProgress) {
        onProgress(
          `Whisper antwortet noch nicht (Versuch ${attempt}/${ATTEMPTS}) – ` +
            `neuer Versuch in ${waitMs / 1000}s. Beim ersten Lauf lädt der Dienst sein Modell.`
        );
      }
      await sleep(waitMs, signal);
      if (onProgress) onProgress('Whisper rechnet … (je nach Länge einige Minuten)');
    }
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

module.exports = { transcribeLocal, describeFetchError, causeCode };
