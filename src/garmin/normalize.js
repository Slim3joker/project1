const db = require('../db');

// Garmin schickt Summaries nachträglich auch aktualisiert (gleiche calendarDate,
// neuere Werte) — deshalb überall UPSERT statt INSERT.

const upsertDaily = db.prepare(`
  INSERT INTO dailies (calendar_date, steps, distance_m, active_kcal, resting_hr,
                       avg_stress, max_stress, body_battery_charged, body_battery_drained, updated_at)
  VALUES (@calendar_date, @steps, @distance_m, @active_kcal, @resting_hr,
          @avg_stress, @max_stress, @body_battery_charged, @body_battery_drained, datetime('now'))
  ON CONFLICT(calendar_date) DO UPDATE SET
    steps = COALESCE(excluded.steps, steps),
    distance_m = COALESCE(excluded.distance_m, distance_m),
    active_kcal = COALESCE(excluded.active_kcal, active_kcal),
    resting_hr = COALESCE(excluded.resting_hr, resting_hr),
    avg_stress = COALESCE(excluded.avg_stress, avg_stress),
    max_stress = COALESCE(excluded.max_stress, max_stress),
    body_battery_charged = COALESCE(excluded.body_battery_charged, body_battery_charged),
    body_battery_drained = COALESCE(excluded.body_battery_drained, body_battery_drained),
    updated_at = datetime('now')
`);

const upsertSleep = db.prepare(`
  INSERT INTO sleep (calendar_date, start_time_s, duration_sec, deep_sec, light_sec,
                     rem_sec, awake_sec, sleep_score, updated_at)
  VALUES (@calendar_date, @start_time_s, @duration_sec, @deep_sec, @light_sec,
          @rem_sec, @awake_sec, @sleep_score, datetime('now'))
  ON CONFLICT(calendar_date) DO UPDATE SET
    start_time_s = COALESCE(excluded.start_time_s, start_time_s),
    duration_sec = COALESCE(excluded.duration_sec, duration_sec),
    deep_sec = COALESCE(excluded.deep_sec, deep_sec),
    light_sec = COALESCE(excluded.light_sec, light_sec),
    rem_sec = COALESCE(excluded.rem_sec, rem_sec),
    awake_sec = COALESCE(excluded.awake_sec, awake_sec),
    sleep_score = COALESCE(excluded.sleep_score, sleep_score),
    updated_at = datetime('now')
`);

const upsertHrv = db.prepare(`
  INSERT INTO hrv (calendar_date, last_night_avg, last_night_high, updated_at)
  VALUES (@calendar_date, @last_night_avg, @last_night_high, datetime('now'))
  ON CONFLICT(calendar_date) DO UPDATE SET
    last_night_avg = COALESCE(excluded.last_night_avg, last_night_avg),
    last_night_high = COALESCE(excluded.last_night_high, last_night_high),
    updated_at = datetime('now')
`);

const upsertUserMetrics = db.prepare(`
  INSERT INTO user_metrics (calendar_date, vo2max, fitness_age, updated_at)
  VALUES (@calendar_date, @vo2max, @fitness_age, datetime('now'))
  ON CONFLICT(calendar_date) DO UPDATE SET
    vo2max = COALESCE(excluded.vo2max, vo2max),
    fitness_age = COALESCE(excluded.fitness_age, fitness_age),
    updated_at = datetime('now')
`);

const upsertBodyBattery = db.prepare(`
  INSERT INTO body_battery (ts_s, calendar_date, value) VALUES (?, ?, ?)
  ON CONFLICT(ts_s) DO UPDATE SET value = excluded.value
`);

const upsertStress = db.prepare(`
  INSERT INTO stress_series (ts_s, calendar_date, value) VALUES (?, ?, ?)
  ON CONFLICT(ts_s) DO UPDATE SET value = excluded.value
`);

function num(v) {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function handleDailies(items) {
  for (const d of items) {
    if (!d.calendarDate) continue;
    upsertDaily.run({
      calendar_date: d.calendarDate,
      steps: num(d.steps),
      distance_m: num(d.distanceInMeters),
      active_kcal: num(d.activeKilocalories),
      resting_hr: num(d.restingHeartRateInBeatsPerMinute),
      avg_stress: num(d.averageStressLevel),
      max_stress: num(d.maxStressLevel),
      body_battery_charged: num(d.bodyBatteryChargedValue),
      body_battery_drained: num(d.bodyBatteryDrainedValue),
    });
  }
}

function handleSleeps(items) {
  for (const s of items) {
    if (!s.calendarDate) continue;
    // Garmin schickt teils mehrere Sleep-Records pro Nacht (validation states);
    // der jeweils letzte Push ist der aktuellste — UPSERT regelt das.
    const score = s.overallSleepScore && num(s.overallSleepScore.value);
    upsertSleep.run({
      calendar_date: s.calendarDate,
      start_time_s: num(s.startTimeInSeconds),
      duration_sec: num(s.durationInSeconds),
      deep_sec: num(s.deepSleepDurationInSeconds),
      light_sec: num(s.lightSleepDurationInSeconds),
      rem_sec: num(s.remSleepInSeconds) ?? num(s.remSleepDurationInSeconds),
      awake_sec: num(s.awakeDurationInSeconds),
      sleep_score: score ?? null,
    });
  }
}

function handleHrv(items) {
  for (const h of items) {
    if (!h.calendarDate) continue;
    upsertHrv.run({
      calendar_date: h.calendarDate,
      last_night_avg: num(h.lastNightAvg),
      last_night_high: num(h.lastNight5MinHigh),
    });
  }
}

function handleUserMetrics(items) {
  for (const m of items) {
    if (!m.calendarDate) continue;
    upsertUserMetrics.run({
      calendar_date: m.calendarDate,
      vo2max: num(m.vo2Max),
      fitness_age: num(m.fitnessAge),
    });
  }
}

// stressDetails enthalten die Zeitreihen: timeOffsetBodyBatteryValues und
// timeOffsetStressLevelValues als { "<offsetSekunden>": wert }
const insertSeries = db.transaction((startS, calendarDate, bbValues, stressValues) => {
  for (const [offset, value] of Object.entries(bbValues || {})) {
    if (num(value) === null) continue;
    upsertBodyBattery.run(startS + Number(offset), calendarDate, value);
  }
  for (const [offset, value] of Object.entries(stressValues || {})) {
    if (num(value) === null || value < 0) continue; // -1/-2 = Messung nicht möglich
    upsertStress.run(startS + Number(offset), calendarDate, value);
  }
});

function handleStressDetails(items) {
  for (const s of items) {
    if (!s.calendarDate || num(s.startTimeInSeconds) === null) continue;
    insertSeries(
      s.startTimeInSeconds,
      s.calendarDate,
      s.timeOffsetBodyBatteryValues,
      s.timeOffsetStressLevelValues
    );
  }
}

// Mapping: Key im Webhook-Payload → Handler
const HANDLERS = {
  dailies: handleDailies,
  sleeps: handleSleeps,
  hrv: handleHrv,
  hrvSummaries: handleHrv,
  userMetrics: handleUserMetrics,
  stressDetails: handleStressDetails,
  allDayStress: handleStressDetails,
};

const insertRaw = db.prepare(
  'INSERT INTO raw_events (summary_type, payload) VALUES (?, ?)'
);

/**
 * Verarbeitet einen kompletten Garmin-Push-Body, z.B. { "dailies": [...] }.
 * Unbekannte Summary-Typen landen nur in raw_events (nichts geht verloren).
 * @returns {{ processed: string[], unknown: string[] }}
 */
function processWebhookBody(body) {
  const processed = [];
  const unknown = [];
  for (const [key, items] of Object.entries(body || {})) {
    if (!Array.isArray(items)) continue;
    insertRaw.run(key, JSON.stringify(items));
    const handler = HANDLERS[key];
    if (handler) {
      handler(items);
      processed.push(key);
    } else {
      unknown.push(key);
    }
  }
  return { processed, unknown };
}

module.exports = { processWebhookBody, HANDLERS };
