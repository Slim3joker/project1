/* MeinZyklus – winziger Server ohne Abhängigkeiten.
   Serviert die App (index.html) und speichert die Zyklusdaten zentral,
   damit alle Geräte dieselben Daten sehen.
     GET  /api/data  -> gespeicherte Daten (oder seed.json beim Erststart)
     POST /api/data  -> Daten speichern (nach /data/data.json)
   Die Daten liegen im gemounteten Volume /data und bleiben so erhalten. */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 80;
const DATA_DIR = process.env.DATA_DIR || '/data';
const DATA_FILE = path.join(DATA_DIR, 'data.json');
const SEED_FILE = path.join(DATA_DIR, 'seed.json');
const HTML_FILE = path.join(__dirname, 'index.html');
const MAX_BODY = 5 * 1024 * 1024; // 5 MB

const EMPTY = { periods: [], notes: {}, settings: { defaultCycleLength: 28, defaultPeriodLength: 5 } };

function send(res, status, type, body) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

function readStored() {
  try {
    return fs.readFileSync(DATA_FILE, 'utf8');
  } catch {
    // Erststart: falls eine seed.json daneben liegt, die als Startdaten liefern
    try {
      const seed = fs.readFileSync(SEED_FILE, 'utf8');
      JSON.parse(seed);
      return seed;
    } catch {
      return JSON.stringify(EMPTY);
    }
  }
}

function writeStored(parsed) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(parsed, null, 2));
  fs.renameSync(tmp, DATA_FILE); // atomar, damit nie eine halbe Datei entsteht
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url === '/api/data') {
    if (req.method === 'GET') {
      return send(res, 200, 'application/json; charset=utf-8', readStored());
    }
    if (req.method === 'POST') {
      let body = '';
      let aborted = false;
      req.on('data', chunk => {
        body += chunk;
        if (body.length > MAX_BODY) { aborted = true; req.destroy(); }
      });
      req.on('end', () => {
        if (aborted) return;
        try {
          const parsed = JSON.parse(body);
          if (!parsed || !Array.isArray(parsed.periods)) throw new Error('ungültig');
          writeStored(parsed);
          send(res, 200, 'application/json', '{"ok":true}');
        } catch {
          send(res, 400, 'application/json', '{"ok":false,"error":"invalid data"}');
        }
      });
      return;
    }
    return send(res, 405, 'application/json', '{"ok":false}');
  }

  if (url === '/seed.json') {
    try {
      return send(res, 200, 'application/json; charset=utf-8', fs.readFileSync(SEED_FILE, 'utf8'));
    } catch {
      return send(res, 404, 'application/json', '{}');
    }
  }

  // Alles andere: die App ausliefern
  fs.readFile(HTML_FILE, (err, content) => {
    if (err) return send(res, 500, 'text/plain', 'Server error');
    send(res, 200, 'text/html; charset=utf-8', content);
  });
});

server.listen(PORT, () => {
  console.log('MeinZyklus läuft auf Port ' + PORT + ' – Daten in ' + DATA_FILE);
});
