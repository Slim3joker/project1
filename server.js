"use strict";

/* FBA Cockpit – Server
 *
 * Bewusst ohne npm-Abhängigkeiten: nur Node-Bordmittel. Dadurch braucht der
 * Docker-Container kein `npm install` und kann nicht durch kaputte Pakete
 * ausfallen.
 *
 * Daten liegen in EINER JSON-Datei (DATA_DIR/fba-cockpit.json). Alle Geräte
 * lesen und schreiben denselben Stand, deshalb rechnet der Server die
 * Bestandsbewegungen selbst aus – nicht der Browser. Sonst könnten sich zwei
 * gleichzeitig geöffnete Geräte gegenseitig die Bestände überschreiben.
 */

const http = require("http");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT) || 8477;
const DATA_DIR = process.env.DATA_DIR || "/data";
const DATA_FILE = path.join(DATA_DIR, "fba-cockpit.json");
const PASSWORD = process.env.FBA_PASSWORD || "";
/* Login lässt sich bewusst abschalten (FBA_AUTH=off) – z. B. wenn stattdessen
 * Cloudflare Access davor hängt. Nur als ausdrücklicher Schalter, damit ein
 * vergessenes Passwort nicht versehentlich alles offenlegt. */
const AUTH_OFF = String(process.env.FBA_AUTH || "").toLowerCase() === "off";
const PUBLIC_DIR = path.join(__dirname, "public");
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 Tage

const KRITISCH_TAGE = 28; // Low-Inventory-Level-Fee-Grenze
const MOVE_TEXT = {
  wareneingang: "Lieferung erhalten (zuhause +)",
  sendung: "Sendung an Amazon (zuhause − / unterwegs +)",
  eingelagert: "Bei Amazon eingelagert (unterwegs − / FBA +)",
  inventur_fba: "Inventur FBA (Bestand gesetzt)",
  inventur_home: "Inventur zuhause (Bestand gesetzt)"
};

/* ---------- Datenhaltung ---------- */

const EMPTY = {
  version: 1,
  firma: {
    firma: "", rechtsform: "", inhaber: "", strasse: "", plzOrt: "",
    email: "", telefon: "", steuernummer: "", ustIdNr: "", eori: "",
    iban: "", bank: "", amazonSellerId: "", notizen: ""
  },
  skus: [],
  dokumente: [],
  journal: []
};

let DATA = structuredClone(EMPTY);
let writeChain = Promise.resolve();

function uid() {
  return "id-" + Date.now().toString(36) + "-" + crypto.randomBytes(4).toString("hex");
}

async function loadData() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fsp.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    DATA = Object.assign(structuredClone(EMPTY), parsed);
    if (!Array.isArray(DATA.skus)) DATA.skus = [];
    if (!Array.isArray(DATA.dokumente)) DATA.dokumente = [];
    if (!Array.isArray(DATA.journal)) DATA.journal = [];
    console.log(`[data] ${DATA_FILE} geladen: ${DATA.skus.length} SKUs, ${DATA.dokumente.length} Dokumente`);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log(`[data] ${DATA_FILE} existiert noch nicht – starte mit leerem Bestand`);
      await persist();
    } else {
      // Kaputte Datei NICHT überschreiben – lieber hart abbrechen als Daten verlieren.
      console.error(`[data] ${DATA_FILE} ist unlesbar: ${err.message}`);
      console.error("[data] Datei prüfen oder aus einem Export wiederherstellen. Server startet nicht.");
      process.exit(1);
    }
  }
}

/* Schreibt atomar (temp + rename) und serialisiert alle Schreibvorgänge,
 * damit sich parallele Requests nicht in die Quere kommen. */
function persist() {
  writeChain = writeChain.then(async () => {
    const tmp = DATA_FILE + ".tmp";
    await fsp.writeFile(tmp, JSON.stringify(DATA, null, 2), "utf8");
    await fsp.rename(tmp, DATA_FILE);
  }).catch(err => {
    console.error("[data] Speichern fehlgeschlagen:", err.message);
    throw err;
  });
  return writeChain;
}

/* ---------- Sessions ---------- */

const sessions = new Map(); // token -> expiry

function createSession() {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, Date.now() + SESSION_MAX_AGE_MS);
  return token;
}
function validSession(token) {
  if (!token) return false;
  const exp = sessions.get(token);
  if (!exp) return false;
  if (exp < Date.now()) { sessions.delete(token); return false; }
  return true;
}
function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie;
  if (!raw) return out;
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
function timingSafeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/* ---------- HTTP-Helfer ---------- */

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store"
  });
  res.end(body);
}

async function readBody(req, limitBytes = 5 * 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limitBytes) throw new Error("Anfrage zu groß");
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
               ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
               ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };

function serveStatic(res, urlPath) {
  const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const file = path.join(PUBLIC_DIR, rel);
  // Kein Ausbruch aus public/
  if (!file.startsWith(PUBLIC_DIR + path.sep) && file !== path.join(PUBLIC_DIR, "index.html")) {
    return sendJson(res, 403, { error: "Verboten" });
  }
  fs.readFile(file, (err, buf) => {
    if (err) return sendJson(res, 404, { error: "Nicht gefunden" });
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(file)] || "application/octet-stream",
      "Content-Length": buf.length,
      "Cache-Control": "no-cache"
    });
    res.end(buf);
  });
}

/* ---------- Eingaben säubern ---------- */

const num = (v, min = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(min, n) : min;
};
const int = (v, min = 0) => Math.round(num(v, min));
const str = (v, max = 300) => String(v ?? "").trim().slice(0, max);

function cleanSku(input, existing = {}) {
  return {
    id: existing.id || uid(),
    sku: str(input.sku, 100),
    asin: str(input.asin, 20),
    name: str(input.name, 200),
    fba: int(input.fba),
    inbound: int(input.inbound),
    home: int(input.home),
    salesPerDay: num(input.salesPerDay),
    leadTime: int(input.leadTime),
    moq: int(input.moq),
    targetDays: Math.max(1, int(input.targetDays)) || 60
  };
}

function cleanDoc(input, existing = {}) {
  return {
    id: existing.id || uid(),
    name: str(input.name, 200),
    kategorie: str(input.kategorie, 60),
    datum: str(input.datum, 10),
    link: str(input.link, 1000),
    notiz: str(input.notiz, 500)
  };
}

function addJournal(entry) {
  DATA.journal.unshift(entry);
  DATA.journal = DATA.journal.slice(0, 500);
}

/* ---------- Bewegungen (Single Source of Truth) ---------- */

function applyMovement(sku, typ, menge) {
  const m = int(menge);
  switch (typ) {
    case "wareneingang":
      sku.home += m; break;
    case "sendung": {
      const move = Math.min(m, sku.home);
      sku.home -= move; sku.inbound += move;
      return move;
    }
    case "eingelagert": {
      const move = Math.min(m, sku.inbound);
      sku.inbound -= move; sku.fba += move;
      return move;
    }
    case "inventur_fba":
      sku.fba = m; break;
    case "inventur_home":
      sku.home = m; break;
    default:
      return null;
  }
  return m;
}

/* ---------- Router ---------- */

async function handleApi(req, res, url) {
  const p = url.pathname;

  // Login/Status brauchen keine Session
  if (p === "/api/status" && req.method === "GET") {
    return sendJson(res, 200, {
      authRequired: !AUTH_OFF,
      authenticated: AUTH_OFF || validSession(parseCookies(req).fba_session)
    });
  }

  if (p === "/api/login" && req.method === "POST") {
    if (!PASSWORD) return sendJson(res, 503, { error: "Kein Passwort konfiguriert" });
    const body = await readBody(req);
    if (!timingSafeEqual(body.password ?? "", PASSWORD)) {
      return sendJson(res, 401, { error: "Falsches Passwort" });
    }
    const token = createSession();
    res.setHeader("Set-Cookie",
      `fba_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE_MS / 1000}`);
    return sendJson(res, 200, { ok: true });
  }

  // Ab hier: Session nötig (außer der Login ist ausdrücklich abgeschaltet)
  const token = parseCookies(req).fba_session;
  if (!AUTH_OFF && !validSession(token)) return sendJson(res, 401, { error: "Nicht angemeldet" });

  if (p === "/api/logout" && req.method === "POST") {
    sessions.delete(token);
    res.setHeader("Set-Cookie", "fba_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
    return sendJson(res, 200, { ok: true });
  }

  if (p === "/api/state" && req.method === "GET") {
    return sendJson(res, 200, DATA);
  }

  if (p === "/api/firma" && req.method === "PUT") {
    const body = await readBody(req);
    for (const key of Object.keys(EMPTY.firma)) {
      if (key in body) DATA.firma[key] = str(body[key], key === "notizen" ? 2000 : 200);
    }
    await persist();
    return sendJson(res, 200, DATA.firma);
  }

  if (p === "/api/skus" && req.method === "POST") {
    const body = await readBody(req);
    if (!str(body.sku) || !str(body.name)) {
      return sendJson(res, 400, { error: "SKU und Produktname sind Pflicht" });
    }
    const sku = cleanSku(body);
    DATA.skus.push(sku);
    await persist();
    return sendJson(res, 201, sku);
  }

  let m = p.match(/^\/api\/skus\/([\w-]+)$/);
  if (m) {
    const sku = DATA.skus.find(s => s.id === m[1]);
    if (!sku) return sendJson(res, 404, { error: "SKU nicht gefunden" });

    if (req.method === "PUT") {
      const body = await readBody(req);
      if (!str(body.sku) || !str(body.name)) {
        return sendJson(res, 400, { error: "SKU und Produktname sind Pflicht" });
      }
      Object.assign(sku, cleanSku(body, sku));
      await persist();
      return sendJson(res, 200, sku);
    }
    if (req.method === "DELETE") {
      DATA.skus = DATA.skus.filter(s => s.id !== sku.id);
      await persist();
      return sendJson(res, 200, { ok: true });
    }
  }

  m = p.match(/^\/api\/skus\/([\w-]+)\/bewegung$/);
  if (m && req.method === "POST") {
    const sku = DATA.skus.find(s => s.id === m[1]);
    if (!sku) return sendJson(res, 404, { error: "SKU nicht gefunden" });
    const body = await readBody(req);
    const typ = str(body.typ, 30);
    if (!MOVE_TEXT[typ]) return sendJson(res, 400, { error: "Unbekannte Bewegungsart" });
    const gebucht = applyMovement(sku, typ, body.menge);
    addJournal({
      ts: new Date().toISOString(), sku: sku.sku, typ,
      text: MOVE_TEXT[typ], menge: gebucht, notiz: str(body.notiz, 200)
    });
    await persist();
    return sendJson(res, 200, { sku, gebucht });
  }

  if (p === "/api/dokumente" && req.method === "POST") {
    const body = await readBody(req);
    if (!str(body.name)) return sendJson(res, 400, { error: "Bezeichnung ist Pflicht" });
    const doc = cleanDoc(body);
    DATA.dokumente.push(doc);
    await persist();
    return sendJson(res, 201, doc);
  }

  m = p.match(/^\/api\/dokumente\/([\w-]+)$/);
  if (m) {
    const doc = DATA.dokumente.find(d => d.id === m[1]);
    if (!doc) return sendJson(res, 404, { error: "Dokument nicht gefunden" });
    if (req.method === "PUT") {
      const body = await readBody(req);
      if (!str(body.name)) return sendJson(res, 400, { error: "Bezeichnung ist Pflicht" });
      Object.assign(doc, cleanDoc(body, doc));
      await persist();
      return sendJson(res, 200, doc);
    }
    if (req.method === "DELETE") {
      DATA.dokumente = DATA.dokumente.filter(d => d.id !== doc.id);
      await persist();
      return sendJson(res, 200, { ok: true });
    }
  }

  if (p === "/api/import" && req.method === "POST") {
    const body = await readBody(req);
    if (!body || !Array.isArray(body.skus)) {
      return sendJson(res, 400, { error: "Backup-Format nicht erkannt" });
    }
    DATA = Object.assign(structuredClone(EMPTY), body);
    DATA.skus = DATA.skus.map(s => cleanSku(s, s));
    DATA.dokumente = (DATA.dokumente || []).map(d => cleanDoc(d, d));
    await persist();
    return sendJson(res, 200, DATA);
  }

  return sendJson(res, 404, { error: "Unbekannter Endpunkt" });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  // Ohne Passwort läuft die App bewusst NICHT – sonst stünden Steuernummer
  // und IBAN offen im Netz, sobald der Cloudflare Tunnel darauf zeigt.
  // Ausnahme: FBA_AUTH=off, wenn der Schutz woanders sitzt (z. B. Cloudflare Access).
  if (!PASSWORD && !AUTH_OFF && !url.pathname.startsWith("/api/")) {
    const msg = `<!doctype html><meta charset="utf-8"><title>FBA Cockpit – Einrichtung</title>
<body style="font:16px/1.6 system-ui,sans-serif;max-width:40em;margin:3em auto;padding:0 1.5em">
<h1>Noch ein Schritt: Passwort setzen</h1>
<p>Das Dashboard startet erst, wenn ein Passwort gesetzt ist – sonst wären deine
Firmendaten (Steuernummer, IBAN) über den Tunnel offen im Internet erreichbar.</p>
<p>In Unraid: <b>Docker → fba-cockpit → Edit → Add another Path, Port, Variable…</b><br>
Typ <b>Variable</b>, Key <code>FBA_PASSWORD</code>, Value = dein Wunschpasswort → <b>Apply</b>.</p>
<p>Achtung: Ein leerer Wert zählt als „nicht gesetzt“.</p>
</body>`;
    res.writeHead(503, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(msg);
  }

  if (url.pathname.startsWith("/api/")) {
    handleApi(req, res, url).catch(err => {
      console.error("[api]", req.method, url.pathname, err.message);
      if (!res.headersSent) sendJson(res, 400, { error: err.message || "Fehler" });
    });
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    return sendJson(res, 405, { error: "Methode nicht erlaubt" });
  }
  serveStatic(res, url.pathname);
});

loadData().then(() => {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[start] FBA Cockpit läuft auf Port ${PORT}`);
    console.log(`[start] Daten: ${DATA_FILE}`);
    if (AUTH_OFF) {
      console.log("[start] ACHTUNG: Login ist abgeschaltet (FBA_AUTH=off).");
      console.log("[start] Wer die Adresse erreicht, sieht alle Daten – Schutz muss davor liegen (Cloudflare Access).");
    } else {
      console.log(PASSWORD
        ? "[start] Passwortschutz aktiv"
        : "[start] ACHTUNG: FBA_PASSWORD ist nicht gesetzt – Dashboard bleibt gesperrt");
    }
  });
});

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    console.log(`[stop] ${sig} – fahre herunter`);
    server.close(() => writeChain.finally(() => process.exit(0)));
  });
}

module.exports = { KRITISCH_TAGE };
