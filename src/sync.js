const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Im Container liegt das venv unter /opt/venv; lokal reicht "python3".
const PYTHON_BIN = process.env.PYTHON_BIN || (fs.existsSync('/opt/venv/bin/python3') ? '/opt/venv/bin/python3' : 'python3');
const POLLER_DIR = path.join(__dirname, '..', 'poller');
const TOKEN_DIR = process.env.GARTH_TOKEN_DIR || path.join(process.env.DATA_DIR || '/data', 'garth');

const INTERVAL_MIN = Number(process.env.POLL_INTERVAL_MIN) || 180;
const POLL_DAYS = Number(process.env.POLL_DAYS) || 2;
const ENABLED = (process.env.POLL_ENABLED || 'true').toLowerCase() !== 'false';

const state = {
  running: false,
  lastRunAt: null,
  lastSuccessAt: null,
  lastError: null,
  lastOutput: null,
};

/** Ist die einmalige Garmin-Connect-Anmeldung erfolgt? */
function isLoggedIn() {
  try {
    return fs.existsSync(TOKEN_DIR) && fs.readdirSync(TOKEN_DIR).length > 0;
  } catch {
    return false;
  }
}

/**
 * Startet den Python-Poller einmal.
 * @param {number} days Wie viele Tage rückwirkend geholt werden.
 * @returns {Promise<{ok: boolean, output: string}>}
 */
function runOnce(days = POLL_DAYS) {
  if (state.running) {
    return Promise.resolve({ ok: false, output: 'Synchronisation läuft bereits.' });
  }
  state.running = true;
  state.lastRunAt = new Date().toISOString();

  return new Promise((resolve) => {
    const child = spawn(PYTHON_BIN, ['sync.py', '--days', String(days)], {
      cwd: POLLER_DIR,
      env: {
        ...process.env,
        GARTH_TOKEN_DIR: TOKEN_DIR,
        INTERNAL_WEBHOOK_URL:
          process.env.INTERNAL_WEBHOOK_URL ||
          `http://127.0.0.1:${process.env.PORT || 3000}/webhook/garmin`,
      },
    });

    let output = '';
    const collect = (chunk) => {
      output += chunk.toString();
      process.stdout.write(chunk);
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);

    child.on('error', (err) => {
      state.running = false;
      state.lastError = err.message;
      state.lastOutput = output;
      resolve({ ok: false, output: err.message });
    });

    child.on('close', (code) => {
      state.running = false;
      state.lastOutput = output.slice(-2000);
      if (code === 0) {
        state.lastSuccessAt = new Date().toISOString();
        state.lastError = null;
        resolve({ ok: true, output });
      } else {
        state.lastError = `Poller endete mit Code ${code}`;
        resolve({ ok: false, output });
      }
    });
  });
}

function status() {
  return {
    enabled: ENABLED,
    loggedIn: isLoggedIn(),
    intervalMinutes: INTERVAL_MIN,
    days: POLL_DAYS,
    ...state,
  };
}

/** Periodischen Abruf starten (nur wenn aktiviert). */
function start() {
  if (!ENABLED) {
    console.log('Automatischer Abruf ist deaktiviert (POLL_ENABLED=false).');
    return;
  }
  if (!isLoggedIn()) {
    console.log('Noch nicht bei Garmin Connect angemeldet — Abruf pausiert.');
    console.log('Einmalig ausführen: docker exec -it garmin-health /opt/venv/bin/python3 /app/poller/login.py');
  }

  const tick = () => {
    if (!isLoggedIn()) return; // wartet geduldig auf die Anmeldung
    runOnce().catch((err) => console.error('Abruf fehlgeschlagen:', err.message));
  };

  setTimeout(tick, 15000); // kurz nach dem Start einmal holen
  setInterval(tick, INTERVAL_MIN * 60 * 1000);
  console.log(`Automatischer Abruf alle ${INTERVAL_MIN} Minuten (${POLL_DAYS} Tage rückwirkend).`);
}

module.exports = { start, runOnce, status, isLoggedIn };
