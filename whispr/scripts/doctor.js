#!/usr/bin/env node
'use strict';

/**
 * Selbsttest. Beantwortet die Frage "warum geht es nicht" mit einer Ursache
 * statt mit einem Verdacht.
 *
 * Am aussagekräftigsten aus dem Container heraus – dann läuft der Test auf
 * genau demselben Netzwerkweg, den die App auch nimmt:
 *
 *     docker exec whispr node scripts/doctor.js
 *
 * Getestet wird der ganze Weg: Konfiguration, Ausgabeordner, Erreichbarkeit
 * des Whisper-Dienstes und eine echte Transkription mit einer selbst erzeugten
 * Tondatei. Wenn dieser Test durchläuft, funktioniert auch ein Upload.
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const os = require('os');
const config = require('../lib/config');
const { causeCode } = require('../lib/transcribe/local');

// ANSI nur, wenn wirklich ein Terminal dranhängt.
const tty = process.stdout.isTTY;
const ESC = String.fromCharCode(27);
const c = (code, s) => (tty ? `${ESC}[${code}m${s}${ESC}[0m` : s);
const bold = (s) => c('1', s);
const dim = (s) => c('2', s);
const green = (s) => c('32', s);
const red = (s) => c('31', s);
const yellow = (s) => c('33', s);

const problems = [];
const hints = [];

function pass(label, detail) {
  console.log(`  ${green('✓')} ${label}${detail ? dim(' · ' + detail) : ''}`);
}
function warn(label, detail) {
  console.log(`  ${yellow('!')} ${label}${detail ? dim(' · ' + detail) : ''}`);
}
function fail(label, detail) {
  console.log(`  ${red('✗')} ${label}${detail ? dim(' · ' + detail) : ''}`);
  problems.push(label);
}

/** RAM-Bedarf der Modelle beim Laden, grob und bewusst nicht knapp geschätzt. */
const MODEL_RAM_GB = {
  tiny: 0.6,
  base: 0.9,
  small: 1.8,
  medium: 3.5,
  'large-v1': 5.5,
  'large-v2': 5.5,
  'large-v3': 5.5,
  large: 5.5,
  'distil-large-v3': 3.0,
  'distil-medium.en': 2.0,
};

/**
 * Eine Sekunde Stille als WAV, von Hand zusammengesetzt. Kein ffmpeg, keine
 * Beispieldatei im Repo – der Test soll überall laufen können.
 */
function silentWav(seconds = 1, rate = 16000) {
  const dataBytes = seconds * rate * 2; // 16 Bit, mono
  const buf = Buffer.alloc(44 + dataBytes); // Rest bleibt 0 = Stille
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataBytes, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // Kanäle
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataBytes, 40);
  return buf;
}

/**
 * Wie `causeCode`, aber es bleibt nie nichts übrig: fehlt ein Fehlercode,
 * tut es die Meldung der Ursache oder der Name des Fehlers. Eine DOMException
 * trägt in `code` eine Zahl (TimeoutError = 23) – die wird bewusst verworfen.
 */
function errCode(err) {
  return causeCode(err) || (err.cause && err.cause.message) || err.name || '';
}

function gb(bytes) {
  return (bytes / 1024 ** 3).toFixed(1) + ' GB';
}

// --------------------------------------------------------------- Abschnitte ---

function reportConfig() {
  console.log(bold('\nKonfiguration'));
  console.log(`  Backend      ${config.backend}`);
  if (config.backend === 'local') console.log(`  WHISPER_URL  ${config.whisperUrl}`);
  else console.log(`  API          ${config.openaiBaseUrl} · ${config.openaiModel}`);
  console.log(`  Sprache      ${config.language}`);
  console.log(`  Ausgabe      ${config.outputDir}`);
  console.log(`  Arbeitsdir   ${config.dataDir}`);
  const inContainer = fs.existsSync('/.dockerenv');
  console.log(dim(`  Umgebung     ${inContainer ? 'im Container' : 'auf dem Host'} · Node ${process.version}`));
  if (!inContainer) {
    hints.push(
      'Der Test lief auf dem Host, nicht im Container. Die App nimmt einen anderen ' +
        'Netzwerkweg – für ein belastbares Ergebnis:  docker exec whispr node scripts/doctor.js'
    );
  }
}

async function checkDirs() {
  console.log(bold('\nOrdner'));
  for (const [label, dir] of [
    ['Arbeitsverzeichnis', config.dataDir],
    ['Ausgabeordner', config.outputDir],
  ]) {
    try {
      await fsp.mkdir(dir, { recursive: true });
      const probe = path.join(dir, '.whispr-doctor');
      await fsp.writeFile(probe, 'ok');
      await fsp.unlink(probe);
      pass(`${label} beschreibbar`, dir);
    } catch (err) {
      fail(`${label} nicht beschreibbar`, `${dir} – ${err.code || err.message}`);
      if (label === 'Ausgabeordner') {
        hints.push(
          'Der Ausgabeordner ist nicht beschreibbar. Auf Unraid liegt das fast immer an ' +
            'den Rechten des Shares oder an einem Volume, das ins Leere zeigt. Prüfen: ' +
            'ls -ld <Share-Pfad>  – und ob das Volume in der docker-compose.yml stimmt.'
        );
      }
    }
  }

  if (typeof fs.statfs === 'function') {
    try {
      const st = await fsp.statfs(config.dataDir);
      const free = st.bavail * st.bsize;
      if (free < 1 * 1024 ** 3) {
        fail('Freier Speicher knapp', gb(free) + ' frei');
        hints.push('Unter 1 GB frei. Das Whisper-Modell braucht beim Herunterladen mehrere GB.');
      } else {
        pass('Freier Speicher', gb(free) + ' frei');
      }
    } catch {
      /* statfs ist optional – kein Grund für einen Fehler */
    }
  }
}

function checkMemory() {
  if (config.backend !== 'local') return;
  console.log(bold('\nArbeitsspeicher'));

  const total = os.totalmem();
  let available = os.freemem();
  try {
    // MemAvailable ist die ehrlichere Zahl als MemFree: Cache, der geräumt
    // werden kann, zählt mit.
    const meminfo = fs.readFileSync('/proc/meminfo', 'utf8');
    const m = meminfo.match(/^MemAvailable:\s+(\d+) kB/m);
    if (m) available = Number(m[1]) * 1024;
  } catch {
    /* nicht Linux – os.freemem() muss reichen */
  }

  console.log(dim(`  ${gb(total)} gesamt · ${gb(available)} verfügbar`));

  // Das Modell steht in der Umgebung des whisper-Containers, nicht in unserer.
  // Deshalb nur eine Einordnung, was mit dem freien RAM überhaupt geht.
  const fits = Object.entries(MODEL_RAM_GB)
    .filter(([, need]) => need * 1024 ** 3 < available)
    .map(([name]) => name);

  if (fits.includes('large-v3')) {
    pass('Genug RAM auch für large-v3', gb(available) + ' verfügbar');
  } else if (fits.includes('medium')) {
    warn('Reicht bis "medium", nicht für large-v3', gb(available) + ' verfügbar');
    hints.push(
      'Für large-v3 auf der CPU fehlt der RAM (~5,5 GB nötig). Ohne GPU wird der ' +
        'whisper-Container beim Laden vom Kernel abgeschossen – das sieht in der ' +
        'Oberfläche wie ein Netzwerkfehler aus. ASR_MODEL=medium setzen.'
    );
  } else if (fits.includes('small')) {
    warn('Reicht nur bis "small"', gb(available) + ' verfügbar');
    hints.push('ASR_MODEL=small setzen. Größere Modelle passen nicht in den freien RAM.');
  } else {
    fail('Sehr wenig RAM frei', gb(available) + ' verfügbar');
    hints.push('Unter 1,8 GB frei – selbst "small" wird knapp. ASR_MODEL=base probieren.');
  }
}

async function checkReachable() {
  console.log(bold('\nErreichbarkeit'));

  if (config.backend === 'openai') {
    if (!config.openaiKey) {
      fail('OPENAI_API_KEY fehlt');
      return false;
    }
    pass('OPENAI_API_KEY gesetzt', `${config.openaiKey.slice(0, 7)}…`);
    return true;
  }

  for (const probe of ['/docs', '/']) {
    try {
      const res = await fetch(config.whisperUrl + probe, {
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        pass('Whisper-Dienst antwortet', `${config.whisperUrl}${probe} → HTTP ${res.status}`);
        return true;
      }
      warn(`HTTP ${res.status} von ${probe}`);
    } catch (err) {
      const code = errCode(err);
      fail('Whisper-Dienst nicht erreichbar', `${config.whisperUrl} – ${code}`);
      if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') {
        hints.push(
          `Der Name im WHISPER_URL ("${new URL(config.whisperUrl).hostname}") ist nicht ` +
            'auflösbar. Beide Container müssen im selben Docker-Netzwerk hängen – das ist ' +
            'automatisch der Fall, wenn beide aus derselben docker-compose.yml kommen. ' +
            'Ein separat per "docker run" gestarteter Whisper ist NICHT darin: dann die ' +
            'Tower-IP samt veröffentlichtem Port nehmen.'
        );
      } else if (code === 'ECONNREFUSED') {
        hints.push(
          'Verbindung abgelehnt – auf dem Port hört niemand. Läuft der Container? ' +
            'docker ps | grep whisper   ·   docker logs whisper --tail 40'
        );
      } else {
        hints.push(
          'Keine Antwort innerhalb von 8 Sekunden. Entweder startet der Container noch, ' +
            'oder er rechnet gerade an einem anderen Auftrag.'
        );
      }
      return false;
    }
  }
  return false;
}

async function checkTranscription() {
  console.log(bold('\nEchte Transkription'));
  const { transcribe } = require('../lib/transcribe');

  const tmp = path.join(os.tmpdir(), 'whispr-doctor.wav');
  await fsp.writeFile(tmp, silentWav(1));
  console.log(dim('  1 Sekunde Testton erzeugt, wird an den Dienst geschickt …'));
  console.log(dim('  Beim ersten Lauf lädt der Dienst sein Modell – das kann Minuten dauern.'));

  const started = Date.now();
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 10 * 60 * 1000);

  try {
    const result = await transcribe(tmp, {
      backend: config.backend,
      whisperUrl: config.whisperUrl,
      openaiBaseUrl: config.openaiBaseUrl,
      openaiKey: config.openaiKey,
      openaiModel: config.openaiModel,
      language: config.language,
      signal: ac.signal,
      onProgress: (msg) => console.log(dim('  … ' + msg)),
    });
    const secs = ((Date.now() - started) / 1000).toFixed(1);
    pass('Transkription durchgelaufen', `${secs}s · Modell: ${result.model}`);
    console.log(
      dim(
        result.text
          ? `  Erkannter Text: ${JSON.stringify(result.text.slice(0, 60))}`
          : '  Kein Text erkannt – erwartet, die Testdatei ist stumm.'
      )
    );
    return true;
  } catch (err) {
    const secs = ((Date.now() - started) / 1000).toFixed(1);

    if (err.name === 'AbortError') {
      fail('Abbruch nach 10 Minuten ohne Antwort');
      hints.push(
        'Der Dienst hat eine einsekündige Datei in 10 Minuten nicht geschafft. Das ist ' +
          'kein Rechenproblem mehr – meist hängt er beim Herunterladen des Modells. ' +
          'docker logs whisper --tail 40 zeigt, wo er stehen bleibt.'
      );
      return false;
    }

    fail('Transkription fehlgeschlagen', `nach ${secs}s`);
    console.log(dim('  ' + err.message));

    if (err.kind === 'reset') {
      hints.push(
        'Die Verbindung riss MITTEN in der Anfrage ab. Das ist die Signatur eines ' +
          'abgestürzten Containers, nicht eines Netzwerkfehlers – der Dienst war ja ' +
          'eben noch erreichbar. Fast immer zu wenig RAM beim Laden des Modells. ' +
          'Beweis:  docker inspect whisper --format "oom={{.State.OOMKilled}} restarts={{.RestartCount}}"'
      );
    } else if (err.kind === 'unknown' || !err.kind) {
      hints.push(
        'Unbekannte Ursache. Die Logs des Dienstes sagen jetzt mehr als alles andere:  ' +
          'docker logs whisper --tail 60'
      );
    }
    return false;
  } finally {
    clearTimeout(timer);
    await fsp.unlink(tmp).catch(() => {});
  }
}

// ------------------------------------------------------------------- Ablauf ---

async function main() {
  console.log(bold('\n  Whispr Selbsttest'));

  reportConfig();
  await checkDirs();
  checkMemory();

  const reachable = await checkReachable();
  if (reachable) {
    await checkTranscription();
  } else {
    console.log(bold('\nEchte Transkription'));
    console.log(dim('  übersprungen – der Dienst ist nicht erreichbar'));
  }

  console.log('');
  if (!problems.length && !hints.length) {
    console.log(green(bold('  Alles in Ordnung. Ein Upload muss jetzt funktionieren.')));
  } else if (!problems.length) {
    console.log(yellow(bold('  Läuft, mit Anmerkungen:')));
  } else {
    console.log(red(bold(`  ${problems.length} Problem(e) gefunden:`)));
  }

  for (const hint of hints) {
    console.log('');
    for (const line of wrap(hint, 74)) console.log('  ' + line);
  }
  console.log('');

  process.exitCode = problems.length ? 1 : 0;
}

function wrap(text, width) {
  const out = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (line && (line + ' ' + word).length > width) {
      out.push(line);
      line = word;
    } else {
      line = line ? line + ' ' + word : word;
    }
  }
  if (line) out.push(line);
  return out;
}

main().catch((err) => {
  console.error(red('\n  Selbsttest abgebrochen: ') + (err && err.stack ? err.stack : err));
  process.exitCode = 1;
});
