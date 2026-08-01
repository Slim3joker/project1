// Minimaler, abhaengigkeitsfreier iCal-Parser (RFC 5545, pragmatisch).
// Reicht fuer Google-Kalender-Feeds: Einzeltermine + gaengige Wiederholungen
// (DAILY/WEEKLY/MONTHLY/YEARLY inkl. INTERVAL, COUNT, UNTIL, BYDAY, EXDATE),
// aufgeloest fuer ein begrenztes Zeitfenster.

const DAY_MS = 86400000;
const BYDAY = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

// Gefaltete Zeilen (Fortsetzung mit Leerzeichen/Tab) wieder zusammenfuegen.
function unfold(text) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n[ \t]/g, '');
}

// Eine Property-Zeile zerlegen: NAME;PARAM=x:VALUE
function parseLine(line) {
  const colon = line.indexOf(':');
  if (colon === -1) return null;
  const left = line.slice(0, colon);
  const value = line.slice(colon + 1);
  const [name, ...paramParts] = left.split(';');
  const params = {};
  for (const p of paramParts) {
    const eq = p.indexOf('=');
    if (eq !== -1) params[p.slice(0, eq).toUpperCase()] = p.slice(eq + 1);
  }
  return { name: name.toUpperCase(), params, value };
}

// iCal-Datum/Zeit -> { date: Date, allDay: bool }
function parseDate(value, params = {}) {
  const v = (value || '').trim();
  // Nur Datum (ganztaegig): YYYYMMDD
  if (params.VALUE === 'DATE' || /^\d{8}$/.test(v)) {
    const y = +v.slice(0, 4), mo = +v.slice(4, 6), d = +v.slice(6, 8);
    return { date: new Date(y, mo - 1, d), allDay: true };
  }
  const m = v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s, z] = m;
  const date = z
    ? new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s))
    : new Date(+y, +mo - 1, +d, +h, +mi, +s); // TZID -> als lokale Wanduhrzeit
  return { date, allDay: false };
}

function parseRRule(value) {
  const rule = {};
  for (const part of value.split(';')) {
    const [k, val] = part.split('=');
    if (k) rule[k.toUpperCase()] = val;
  }
  return rule;
}

// Rohe VEVENT-Bloecke einlesen.
export function parseICS(text) {
  const lines = unfold(String(text)).split('\n');
  const events = [];
  let cur = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { cur = { exdates: [] }; continue; }
    if (line === 'END:VEVENT') { if (cur) events.push(cur); cur = null; continue; }
    if (!cur) continue;
    const p = parseLine(line);
    if (!p) continue;
    switch (p.name) {
      case 'SUMMARY': cur.summary = p.value; break;
      case 'LOCATION': cur.location = p.value; break;
      case 'UID': cur.uid = p.value; break;
      case 'DTSTART': cur.start = parseDate(p.value, p.params); break;
      case 'DTEND': cur.end = parseDate(p.value, p.params); break;
      case 'RRULE': cur.rrule = parseRRule(p.value); break;
      case 'EXDATE': {
        const dt = parseDate(p.value, p.params);
        if (dt) cur.exdates.push(dt.date.getTime());
        break;
      }
      default: break;
    }
  }
  return events;
}

function addByFreq(date, freq, interval) {
  const d = new Date(date);
  if (freq === 'DAILY') d.setDate(d.getDate() + interval);
  else if (freq === 'WEEKLY') d.setDate(d.getDate() + 7 * interval);
  else if (freq === 'MONTHLY') d.setMonth(d.getMonth() + interval);
  else if (freq === 'YEARLY') d.setFullYear(d.getFullYear() + interval);
  else d.setDate(d.getDate() + interval);
  return d;
}

function withTime(base, template) {
  const d = new Date(base);
  d.setHours(template.getHours(), template.getMinutes(), template.getSeconds(), 0);
  return d;
}

// VEVENTs im Fenster [windowStart, windowEnd] auf konkrete Vorkommen aufloesen.
export function expandEvents(vevents, windowStart, windowEnd) {
  const out = [];
  const MAX = 5000;

  for (const ev of vevents) {
    if (!ev.start) continue;
    const startBase = ev.start.date;
    const allDay = ev.start.allDay;
    const durMs = ev.end
      ? ev.end.date - startBase
      : (allDay ? DAY_MS : 60 * 60 * 1000);

    const push = (s) => {
      if (ev.exdates.includes(s.getTime())) return;
      const e = new Date(s.getTime() + durMs);
      if (e < windowStart || s > windowEnd) return;
      out.push({
        uid: ev.uid || null,
        summary: ev.summary || '(ohne Titel)',
        location: ev.location || null,
        start: s.toISOString(),
        end: e.toISOString(),
        allDay,
      });
    };

    if (!ev.rrule) { push(startBase); continue; }

    const r = ev.rrule;
    const freq = (r.FREQ || '').toUpperCase();
    const interval = Math.max(1, parseInt(r.INTERVAL, 10) || 1);
    const count = r.COUNT ? parseInt(r.COUNT, 10) : null;
    const until = r.UNTIL ? parseDate(r.UNTIL)?.date : null;
    const byday = r.BYDAY ? r.BYDAY.split(',').map((x) => BYDAY[x.replace(/^[+-]?\d+/, '')]).filter((n) => n !== undefined) : null;

    let cursor = new Date(startBase);
    let emitted = 0;
    for (let i = 0; i < MAX; i++) {
      if (count && emitted >= count) break;
      if (until && cursor > until) break;
      if (cursor > windowEnd && !(freq === 'WEEKLY' && byday)) break;
      if (cursor.getTime() - windowEnd.getTime() > 370 * DAY_MS) break;

      if (freq === 'WEEKLY' && byday && byday.length) {
        // Wochenstart (Montag) dieser Iteration
        const weekStart = new Date(cursor);
        const dow = (weekStart.getDay() + 6) % 7; // Mo=0
        weekStart.setDate(weekStart.getDate() - dow);
        for (const targetDow of byday.slice().sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))) {
          const occ = new Date(weekStart);
          const add = (targetDow + 6) % 7;
          occ.setDate(weekStart.getDate() + add);
          const s = allDay ? occ : withTime(occ, startBase);
          if (s < startBase) continue;
          if (until && s > until) break;
          if (count && emitted >= count) break;
          emitted++;
          push(s);
        }
      } else {
        emitted++;
        push(cursor);
      }
      cursor = addByFreq(cursor, freq, interval);
    }
  }

  out.sort((a, b) => new Date(a.start) - new Date(b.start));
  return out;
}

// Komfort: ICS-Text -> aufgeloeste Events fuer die naechsten `days` Tage.
export function eventsFromICS(text, { days = 14, now = new Date() } = {}) {
  const windowStart = new Date(now);
  windowStart.setHours(0, 0, 0, 0);
  const windowEnd = new Date(windowStart.getTime() + days * DAY_MS);
  return expandEvents(parseICS(text), windowStart, windowEnd);
}
