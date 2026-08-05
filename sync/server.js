/* ============================================================
   Kochkiste-Sync — winziges Backend für den geteilten Haushalt
   ------------------------------------------------------------
   - Keine externen Abhängigkeiten (nur Node-Bordmittel).
   - Speichert EINEN gemeinsamen Zustand als JSON-Datei.
   - Schutz per Haushalts-Schlüssel (Header "X-KK-Key").
   - Optimistische Sperre über eine hochzählende "version":
       * GET  /api/state            -> {version, data, updated}
       * PUT  /api/state {baseVersion, data}
             -> 200 {version, updated}         wenn baseVersion aktuell war
             -> 409 {error, current}           wenn jemand anderes schneller war
       * GET  /api/health           -> {ok:true}   (ohne Schlüssel, zum Testen)
   Konfiguration über Umgebungsvariablen:
       KK_KEY   = Haushalts-Schlüssel (Pflicht!)
       PORT     = Port (Standard 8089)
       KK_DATA  = Pfad der Zustandsdatei (Standard /data/state.json)
============================================================ */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT      = process.env.PORT   || 8089;
const KEY       = process.env.KK_KEY || '';
const DATA_FILE = process.env.KK_DATA || '/data/state.json';

function loadState(){
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch(e){ return { version:0, data:null, updated:null }; }
}
function saveState(s){
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive:true });
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(s));
  fs.renameSync(tmp, DATA_FILE); // atomar schreiben, damit nie eine halbe Datei entsteht
}
let state = loadState();

function send(res, code, obj){
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-KK-Key',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Cache-Control': 'no-store'
  });
  res.end(obj === undefined ? '' : JSON.stringify(obj));
}

const server = http.createServer((req, res) => {
  const url = req.url.replace(/\/+$/, '') || '/';

  if (req.method === 'OPTIONS')      return send(res, 204);
  if (url === '/api/health')         return send(res, 200, { ok:true, version: state.version });

  // Schlüssel nur prüfen, wenn überhaupt einer gesetzt ist (KK_KEY leer = offen erreichbar)
  if (KEY && req.headers['x-kk-key'] !== KEY) return send(res, 401, { error:'unauthorized' });

  if (url === '/api/state' && req.method === 'GET') return send(res, 200, state);

  if (url === '/api/state' && req.method === 'PUT') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 3e6) req.destroy(); });
    req.on('end', () => {
      let parsed;
      try { parsed = JSON.parse(body); } catch(e){ return send(res, 400, { error:'bad json' }); }
      const base = parsed.baseVersion;
      if (typeof base === 'number' && base !== state.version) {
        return send(res, 409, { error:'conflict', current: state }); // jemand war schneller
      }
      state = { version:(state.version||0)+1, data: parsed.data, updated: new Date().toISOString() };
      try { saveState(state); } catch(e){ return send(res, 500, { error:'write failed' }); }
      return send(res, 200, { version: state.version, updated: state.updated });
    });
    return;
  }

  send(res, 404, { error:'not found' });
});

if (!KEY) console.log('Hinweis: KK_KEY nicht gesetzt — Backend läuft OHNE Schlüssel (offen, nur über die geheime Adresse geschützt).');
server.listen(PORT, () => console.log('Kochkiste-Sync läuft auf Port ' + PORT + ' (Daten: ' + DATA_FILE + ')'));
