/* global Chart */

const COLORS = {
  accent: '#4ecdc4',
  deep: '#3a5fcd',
  light: '#7ea6f0',
  rem: '#b58cf0',
  awake: '#f0b95d',
  stress: '#f07171',
  steps: '#6fe07f',
  score: '#f0b95d',
  rhr: '#f0857d',
  muted: '#8b93a5',
};

const hasCharts = typeof Chart !== 'undefined';

if (hasCharts) {
  Chart.defaults.color = COLORS.muted;
  Chart.defaults.borderColor = 'rgba(139, 147, 165, 0.15)';
  Chart.defaults.font.family = 'system-ui, sans-serif';
  Chart.defaults.maintainAspectRatio = false;
}

const charts = {};
const state = { days: 30, resolvedDays: 30, range: [] };

function drawChart(id, config) {
  if (!hasCharts) return;
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(document.getElementById(id), config);
}

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

// ---------- Formatierung ----------

function fmtHours(h) {
  if (h == null) return '–';
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh}h ${String(mm).padStart(2, '0')}m`;
}

function shortDate(dateStr) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit',
  });
}

function longDate(dateStr) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('de-DE', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function label(dateStr, days) {
  if (days <= 90) return shortDate(dateStr);
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('de-DE', {
    month: 'short', year: '2-digit',
  });
}

function num(value, digits = 0) {
  return value == null ? '–' : value.toLocaleString('de-DE', {
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  });
}

// ---------- Auswertung ----------

/** Durchschnitt über alle Tage, an denen der Wert existiert (Lücken zählen nicht mit). */
function average(rows, pick) {
  const values = rows.map(pick).filter((v) => v != null && !Number.isNaN(v));
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function count(rows, pick) {
  return rows.map(pick).filter((v) => v != null).length;
}

/** Gleitender Durchschnitt — glättet Tagesausreißer und macht den Trend sichtbar. */
function movingAverage(values, window = 7) {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window + 1), i + 1).filter((v) => v != null);
    if (!slice.length) return null;
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

const pick = {
  sleepH: (d) => (d.sleep ? d.sleep.durationHours : null),
  deepMin: (d) => (d.sleep ? d.sleep.deepMin : null),
  lightMin: (d) => (d.sleep ? d.sleep.lightMin : null),
  remMin: (d) => (d.sleep ? d.sleep.remMin : null),
  score: (d) => (d.sleep ? d.sleep.score : null),
  hrv: (d) => (d.hrv ? d.hrv.lastNightAvg : null),
  bb: (d) => d.bodyBatteryMorning,
  stress: (d) => d.avgStress,
  steps: (d) => d.steps,
  rhr: (d) => d.restingHr,
};

// ---------- Diagramme ----------

function trendChart(id, labels, values, color, opts = {}) {
  const datasets = [{
    label: 'Tageswert',
    data: values,
    borderColor: color + '66',
    backgroundColor: color + '1a',
    borderWidth: 1,
    fill: true,
    tension: 0.25,
    pointRadius: 0,
    spanGaps: true,
  }];

  if (opts.trend !== false) {
    datasets.push({
      label: '7-Tage-Schnitt',
      data: movingAverage(values),
      borderColor: color,
      borderWidth: 2.5,
      fill: false,
      tension: 0.35,
      pointRadius: 0,
      spanGaps: true,
    });
  }

  drawChart(id, {
    type: 'line',
    data: { labels, datasets },
    options: {
      plugins: { legend: { display: false } },
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { ticks: { maxTicksLimit: 10 } },
        y: { beginAtZero: opts.beginAtZero !== false, suggestedMax: opts.max },
      },
    },
  });
}

function renderCharts() {
  const rows = state.range;
  const labels = rows.map((d) => label(d.date, state.resolvedDays));

  // Schlafphasen gestapelt — zeigt Menge UND Verteilung in einem Bild
  drawChart('chart-sleep', {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Tief', data: rows.map((d) => (pick.deepMin(d) ?? 0) / 60), backgroundColor: COLORS.deep, stack: 's' },
        { label: 'Leicht', data: rows.map((d) => (pick.lightMin(d) ?? 0) / 60), backgroundColor: COLORS.light, stack: 's' },
        { label: 'REM', data: rows.map((d) => (pick.remMin(d) ?? 0) / 60), backgroundColor: COLORS.rem, stack: 's' },
      ],
    },
    options: {
      plugins: { legend: { position: 'bottom' } },
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { stacked: true, ticks: { maxTicksLimit: 12 } },
        y: { stacked: true, title: { display: true, text: 'Stunden' } },
      },
    },
  });

  trendChart('chart-hrv', labels, rows.map(pick.hrv), COLORS.rem, { beginAtZero: false });
  trendChart('chart-score', labels, rows.map(pick.score), COLORS.score, { max: 100 });
  trendChart('chart-steps', labels, rows.map(pick.steps), COLORS.steps);
  trendChart('chart-bb', labels, rows.map(pick.bb), COLORS.accent, { max: 100 });
  trendChart('chart-stress', labels, rows.map(pick.stress), COLORS.stress);
  trendChart('chart-rhr', labels, rows.map(pick.rhr), COLORS.rhr, { beginAtZero: false });

  renderWeekdayChart(rows);
}

function renderWeekdayChart(rows) {
  const names = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const buckets = names.map(() => []);

  for (const day of rows) {
    // getDay(): 0 = Sonntag → auf Montag-basierte Reihenfolge umrechnen
    const weekday = (new Date(`${day.date}T12:00:00`).getDay() + 6) % 7;
    buckets[weekday].push(day);
  }

  drawChart('chart-weekday', {
    type: 'bar',
    data: {
      labels: names,
      datasets: [
        {
          label: 'Ø Schlaf (h)',
          data: buckets.map((b) => average(b, pick.sleepH)),
          backgroundColor: COLORS.light,
          yAxisID: 'y',
        },
        {
          label: 'Ø Schritte',
          data: buckets.map((b) => average(b, pick.steps)),
          backgroundColor: COLORS.steps,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      plugins: { legend: { position: 'bottom' } },
      scales: {
        y: { position: 'left', beginAtZero: true, title: { display: true, text: 'Stunden Schlaf' } },
        y1: {
          position: 'right', beginAtZero: true,
          title: { display: true, text: 'Schritte' },
          grid: { drawOnChartArea: false },
        },
      },
    },
  });
}

// ---------- Kennzahlen & Tabelle ----------

function renderSummary() {
  const rows = state.range;
  const set = (id, text) => { document.getElementById(id).textContent = text; };

  const sleep = average(rows, pick.sleepH);
  set('avg-sleep', fmtHours(sleep));
  set('avg-sleep-sub', `${count(rows, pick.sleepH)} Nächte erfasst`);

  const hrv = average(rows, pick.hrv);
  set('avg-hrv', hrv == null ? '–' : `${num(hrv, 1)} ms`);
  const hrvValues = rows.map(pick.hrv).filter((v) => v != null);
  set('avg-hrv-sub', hrvValues.length
    ? `Spanne ${num(Math.min(...hrvValues))}–${num(Math.max(...hrvValues))} ms` : '');

  const steps = average(rows, pick.steps);
  set('avg-steps', steps == null ? '–' : num(steps));
  const stepValues = rows.map(pick.steps).filter((v) => v != null);
  set('avg-steps-sub', stepValues.length ? `Bestwert ${num(Math.max(...stepValues))}` : '');

  const bb = average(rows, pick.bb);
  set('avg-bb', bb == null ? '–' : num(bb));

  const stress = average(rows, pick.stress);
  set('avg-stress', stress == null ? '–' : num(stress));
  set('avg-stress-sub', `${count(rows, pick.stress)} Tage erfasst`);

  const score = average(rows, pick.score);
  set('avg-score', score == null ? '–' : num(score));
  const scoreValues = rows.map(pick.score).filter((v) => v != null);
  set('avg-score-sub', scoreValues.length
    ? `Spanne ${num(Math.min(...scoreValues))}–${num(Math.max(...scoreValues))}` : '');
}

function renderTable() {
  const body = document.querySelector('#history-table tbody');
  // Neueste zuerst, und nur Tage zeigen, an denen überhaupt etwas gemessen wurde
  const rows = [...state.range]
    .reverse()
    .filter((d) => pick.sleepH(d) != null || d.steps != null || pick.hrv(d) != null);

  body.innerHTML = rows
    .map((d) => `<tr>
      <td class="date-cell">${longDate(d.date)}</td>
      <td>${fmtHours(pick.sleepH(d))}</td>
      <td>${num(pick.deepMin(d))}</td>
      <td>${num(pick.lightMin(d))}</td>
      <td>${num(pick.remMin(d))}</td>
      <td>${num(pick.score(d))}</td>
      <td>${num(pick.hrv(d))}</td>
      <td>${num(pick.bb(d))}</td>
      <td>${num(pick.stress(d))}</td>
      <td>${num(d.steps)}</td>
      <td>${num(d.restingHr)}</td>
      <td>${d.vo2max == null ? '–' : num(d.vo2max, 1)}</td>
    </tr>`)
    .join('');

  document.getElementById('table-note').textContent = rows.length
    ? `${rows.length} Tage mit Daten im gewählten Zeitraum. Minutenwerte bei den Schlafphasen.`
    : 'Für diesen Zeitraum sind noch keine Daten gespeichert.';
}

// ---------- Laden & Steuerung ----------

async function load() {
  const available = await getJSON('/api/available').catch(() => null);

  let days = state.days;
  if (days === 'all') {
    if (available && available.firstDate) {
      const first = new Date(`${available.firstDate}T12:00:00Z`);
      const today = new Date(`${available.today}T12:00:00Z`);
      days = Math.max(1, Math.round((today - first) / 86400000) + 1);
    } else {
      days = 30;
    }
  }

  state.resolvedDays = days;
  state.range = await getJSON(`/api/range?days=${days}`);
  document.getElementById('export-csv').href = `/api/export.csv?days=${days}`;

  const first = state.range[0];
  const last = state.range[state.range.length - 1];
  document.getElementById('period-label').textContent =
    `${longDate(first.date)} — ${longDate(last.date)}`;

  renderSummary();
  renderTable();
  try {
    renderCharts();
  } catch (err) {
    console.error('Diagramme konnten nicht gezeichnet werden:', err);
  }
}

async function refreshStatus() {
  try {
    const auth = await getJSON('/auth/status');
    const el = document.getElementById('status');
    if (auth.connected) {
      el.textContent = '● Garmin verbunden';
      el.className = 'status ok';
    } else {
      el.textContent = '⚠ Nicht angemeldet';
      el.className = 'status warn';
    }
  } catch { /* Status ist nice-to-have */ }
}

function setupControls() {
  document.querySelectorAll('#range-buttons button').forEach((button) => {
    button.addEventListener('click', async () => {
      document.querySelectorAll('#range-buttons button')
        .forEach((b) => b.classList.remove('active'));
      button.classList.add('active');
      const value = button.dataset.days;
      state.days = value === 'all' ? 'all' : Number(value);
      await load();
    });
  });
}

async function main() {
  document.getElementById('updated').textContent = new Date().toLocaleTimeString('de-DE');
  setupControls();
  await refreshStatus();
  await load();
}

main().catch((err) => {
  const el = document.getElementById('status');
  el.textContent = '⚠ ' + err.message;
  el.className = 'status warn';
});
