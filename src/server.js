const path = require('path');
const express = require('express');
const db = require('./db');
const { processWebhookBody } = require('./garmin/normalize');
const garmin = require('./garmin/oauth');
const sync = require('./sync');

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = Number(process.env.PORT) || 3000;
// Optionales Shared Secret: Garmin-Webhook-URL dann als /webhook/garmin?secret=...
// Die Lese-API ist bewusst offen — Zugriffsschutz macht Cloudflare Access auf
// der Subdomain (siehe README), n8n greift intern über 192.168.178.32:8100 zu.
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

// ---------- Hilfsfunktionen ----------

function localDate(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  // TZ kommt aus der Container-Umgebung (TZ=Europe/Berlin)
  return d.toLocaleDateString('sv-SE'); // ergibt YYYY-MM-DD
}

function resolveDate(param) {
  if (param === 'today') return localDate(0);
  if (param === 'yesterday') return localDate(-1);
  if (/^\d{4}-\d{2}-\d{2}$/.test(param)) return param;
  return null;
}

/** Verschiebt ein YYYY-MM-DD um delta Tage (Mittag als Anker gegen Sommerzeit-Effekte). */
function addDays(dateStr, delta) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

// Body Battery "Morgen-Wert": höchster Wert zwischen 04:00 und 10:00 lokal,
// sonst der erste Messwert des Tages. Die Stundenfilterung macht SQLite mit
// 'localtime' (nutzt die TZ des Containers) — in JS wäre das bei langen
// Zeiträumen spürbar langsamer.
const morningStmt = db.prepare(`
  SELECT MAX(value) AS value FROM body_battery
  WHERE calendar_date = ?
    AND CAST(strftime('%H', ts_s, 'unixepoch', 'localtime') AS INTEGER) BETWEEN 4 AND 9
`);
const firstOfDayStmt = db.prepare(
  'SELECT value FROM body_battery WHERE calendar_date = ? ORDER BY ts_s LIMIT 1'
);

function morningBodyBattery(calendarDate) {
  const morning = morningStmt.get(calendarDate);
  if (morning && morning.value !== null) return morning.value;
  const first = firstOfDayStmt.get(calendarDate);
  return first ? first.value : null;
}

function dayData(calendarDate) {
  const daily = db.prepare('SELECT * FROM dailies WHERE calendar_date = ?').get(calendarDate) || null;
  const sleep = db.prepare('SELECT * FROM sleep WHERE calendar_date = ?').get(calendarDate) || null;
  const hrv = db.prepare('SELECT * FROM hrv WHERE calendar_date = ?').get(calendarDate) || null;
  const metrics = db.prepare('SELECT * FROM user_metrics WHERE calendar_date = ?').get(calendarDate) || null;
  // VO2max ändert sich selten — letzten bekannten Wert bis einschließlich des Tages nehmen
  const lastVo2 = db
    .prepare('SELECT vo2max FROM user_metrics WHERE calendar_date <= ? AND vo2max IS NOT NULL ORDER BY calendar_date DESC LIMIT 1')
    .get(calendarDate);
  return {
    date: calendarDate,
    steps: daily ? daily.steps : null,
    restingHr: daily ? daily.resting_hr : null,
    avgStress: daily ? daily.avg_stress : null,
    maxStress: daily ? daily.max_stress : null,
    bodyBatteryMorning: morningBodyBattery(calendarDate),
    bodyBatteryCharged: daily ? daily.body_battery_charged : null,
    bodyBatteryDrained: daily ? daily.body_battery_drained : null,
    sleep: sleep
      ? {
          durationSec: sleep.duration_sec,
          durationHours: sleep.duration_sec != null ? Math.round((sleep.duration_sec / 3600) * 100) / 100 : null,
          deepMin: sleep.deep_sec != null ? Math.round(sleep.deep_sec / 60) : null,
          lightMin: sleep.light_sec != null ? Math.round(sleep.light_sec / 60) : null,
          remMin: sleep.rem_sec != null ? Math.round(sleep.rem_sec / 60) : null,
          awakeMin: sleep.awake_sec != null ? Math.round(sleep.awake_sec / 60) : null,
          score: sleep.sleep_score,
        }
      : null,
    hrv: hrv ? { lastNightAvg: hrv.last_night_avg, lastNightHigh: hrv.last_night_high } : null,
    vo2max: (metrics && metrics.vo2max) || (lastVo2 ? lastVo2.vo2max : null),
  };
}

// ---------- Garmin Webhook ----------

app.post('/webhook/garmin', (req, res) => {
  if (WEBHOOK_SECRET && req.query.secret !== WEBHOOK_SECRET) {
    return res.status(403).json({ error: 'forbidden' });
  }

  // Garmin erwartet eine schnelle 200-Antwort — sofort bestätigen,
  // Verarbeitung passiert synchron (SQLite ist schnell genug), Fehler nur loggen.
  try {
    const { processed, unknown } = processWebhookBody(req.body);
    if (unknown.length) console.log('Unbekannte Summary-Typen (nur raw gespeichert):', unknown.join(', '));

    // Ping-Modus: statt Daten kommt eine callbackURL, die man mit dem
    // OAuth-Token abrufen muss. Antwort erst senden, dann asynchron nachladen.
    const pings = [];
    for (const items of Object.values(req.body || {})) {
      if (!Array.isArray(items)) continue;
      for (const item of items) {
        if (item && item.callbackURL) pings.push(item.callbackURL);
      }
    }
    res.status(200).json({ ok: true, processed });

    for (const url of pings) {
      garmin
        .apiFetch(url)
        .then((data) => {
          // Callback liefert dieselbe Struktur wie ein Push
          const body = Array.isArray(data) ? null : data;
          if (body) processWebhookBody(body);
        })
        .catch((err) => console.error('Ping-Callback fehlgeschlagen:', err.message));
    }
  } catch (err) {
    console.error('Webhook-Verarbeitung fehlgeschlagen:', err);
    // Trotzdem 200, damit Garmin den Endpoint nicht deaktiviert — Payload liegt in raw_events
    if (!res.headersSent) res.status(200).json({ ok: false });
  }
});

// ---------- Garmin OAuth ----------

app.get('/auth/garmin', (req, res) => {
  const st = garmin.status();
  if (!st.clientConfigured) {
    return res
      .status(500)
      .send('GARMIN_CLIENT_ID / GARMIN_CLIENT_SECRET sind nicht gesetzt (Unraid-Template → Variablen).');
  }
  res.redirect(garmin.buildAuthorizeUrl());
});

app.get('/auth/garmin/callback', async (req, res) => {
  try {
    await garmin.handleCallback(req.query.code, req.query.state);
    res.send('✅ Garmin verbunden! Du kannst dieses Fenster schließen. Daten kommen ab jetzt automatisch.');
  } catch (err) {
    console.error('OAuth-Callback-Fehler:', err);
    res.status(500).send('❌ Garmin-Verbindung fehlgeschlagen: ' + err.message);
  }
});

app.get('/auth/status', (req, res) => {
  const oauth = garmin.status();
  const poller = sync.status();
  res.json({
    // "connected" ist true, sobald einer der beiden Wege nutzbar ist
    connected: oauth.connected || poller.loggedIn,
    mode: poller.loggedIn ? 'connect' : oauth.connected ? 'webhook' : null,
    oauth,
    poller,
  });
});

// ---------- Garmin-Connect-Abruf ----------

app.post('/api/sync', async (req, res) => {
  if (!sync.isLoggedIn()) {
    return res.status(409).json({
      error: 'Noch nicht bei Garmin Connect angemeldet.',
      hinweis: 'docker exec -it garmin-health /opt/venv/bin/python3 /app/poller/login.py',
    });
  }
  const days = Math.min(Math.max(Number(req.query.days) || 2, 1), 90);
  const result = await sync.runOnce(days);
  res.status(result.ok ? 200 : 500).json({ ...result, status: sync.status() });
});

app.get('/api/sync/status', (req, res) => res.json(sync.status()));

// ---------- Lese-API (Dashboard + n8n) ----------

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/day/:date', (req, res) => {
  const date = resolveDate(req.params.date);
  if (!date) return res.status(400).json({ error: 'Datum als YYYY-MM-DD, "today" oder "yesterday".' });
  res.json(dayData(date));
});

app.get('/api/range', (req, res) => {
  // Obergrenze großzügig: die Verlaufsseite lädt damit auch "alles" am Stück
  const days = Math.min(Math.max(Number(req.query.days) || 7, 1), 3650);
  // Optionales Enddatum, um in die Vergangenheit zu blättern (Standard: heute)
  const end = req.query.end ? resolveDate(req.query.end) : localDate(0);
  if (!end) return res.status(400).json({ error: 'end muss YYYY-MM-DD sein.' });

  const result = [];
  for (let i = days - 1; i >= 0; i--) result.push(dayData(addDays(end, -i)));
  res.json(result);
});

/** Welcher Zeitraum ist überhaupt gespeichert? Füttert die Datumsauswahl im Dashboard. */
app.get('/api/available', (req, res) => {
  const row = db
    .prepare(
      `SELECT MIN(d) AS first, MAX(d) AS last, COUNT(*) AS days FROM (
         SELECT calendar_date AS d FROM dailies
         UNION SELECT calendar_date FROM sleep
         UNION SELECT calendar_date FROM hrv
       )`
    )
    .get();
  res.json({
    firstDate: row.first || null,
    lastDate: row.last || null,
    days: row.days || 0,
    today: localDate(0),
  });
});

/** Alle Tageswerte als CSV — für Excel, Backup oder eigene Auswertungen. */
app.get('/api/export.csv', (req, res) => {
  const days = Math.min(Math.max(Number(req.query.days) || 365, 1), 3650);
  const end = req.query.end ? resolveDate(req.query.end) : localDate(0);
  if (!end) return res.status(400).json({ error: 'end muss YYYY-MM-DD sein.' });

  const columns = [
    ['Datum', (d) => d.date],
    ['Schlafdauer_h', (d) => d.sleep && d.sleep.durationHours],
    ['Tiefschlaf_min', (d) => d.sleep && d.sleep.deepMin],
    ['Leichtschlaf_min', (d) => d.sleep && d.sleep.lightMin],
    ['REM_min', (d) => d.sleep && d.sleep.remMin],
    ['Wach_min', (d) => d.sleep && d.sleep.awakeMin],
    ['Schlaf_Score', (d) => d.sleep && d.sleep.score],
    ['HRV_ms', (d) => d.hrv && d.hrv.lastNightAvg],
    ['BodyBattery_Morgen', (d) => d.bodyBatteryMorning],
    ['Stress_Durchschnitt', (d) => d.avgStress],
    ['Stress_Max', (d) => d.maxStress],
    ['Schritte', (d) => d.steps],
    ['Ruhepuls', (d) => d.restingHr],
    ['VO2Max', (d) => d.vo2max],
  ];

  // Semikolon als Trenner und Komma als Dezimalzeichen — so öffnet Excel (DE) sauber
  const lines = [columns.map((c) => c[0]).join(';')];
  for (let i = days - 1; i >= 0; i--) {
    const day = dayData(addDays(end, -i));
    lines.push(
      columns
        .map(([, get]) => {
          const value = get(day);
          if (value === null || value === undefined) return '';
          return typeof value === 'number' ? String(value).replace('.', ',') : String(value);
        })
        .join(';')
    );
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="health-export-${end}.csv"`);
  res.send('\uFEFF' + lines.join('\n')); // BOM, damit Excel Umlaute richtig liest
});

app.get('/api/series/:date', (req, res) => {
  const date = resolveDate(req.params.date);
  if (!date) return res.status(400).json({ error: 'Datum als YYYY-MM-DD, "today" oder "yesterday".' });
  res.json({
    date,
    bodyBattery: db
      .prepare('SELECT ts_s, value FROM body_battery WHERE calendar_date = ? ORDER BY ts_s')
      .all(date),
    stress: db
      .prepare('SELECT ts_s, value FROM stress_series WHERE calendar_date = ? ORDER BY ts_s')
      .all(date),
  });
});

// ---------- Frontend ----------

// Chart.js lokal ausliefern statt vom CDN — das Dashboard funktioniert damit
// auch ohne Internetzugang und ohne externe Abhängigkeit im Browser.
app.use('/vendor', express.static(path.join(__dirname, '..', 'node_modules', 'chart.js', 'dist')));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.listen(PORT, () => {
  console.log(`garmin-health läuft auf Port ${PORT}`);
  console.log('Webhook:  POST /webhook/garmin');
  console.log('Abruf:    POST /api/sync?days=2');
  console.log('API:      GET  /api/day/yesterday · /api/range?days=7 · /api/series/today');
  sync.start();
});
