/* global Chart */

const COLORS = {
  accent: '#4ecdc4',
  deep: '#3a5fcd',
  light: '#7ea6f0',
  rem: '#b58cf0',
  awake: '#f0b95d',
  stress: '#f07171',
  steps: '#6fe07f',
  grid: 'rgba(139, 147, 165, 0.15)',
  muted: '#8b93a5',
};

Chart.defaults.color = COLORS.muted;
Chart.defaults.borderColor = COLORS.grid;
Chart.defaults.font.family = 'system-ui, sans-serif';

// Zustand der Ansicht: welcher Tag, welcher Verlaufszeitraum
const view = { date: null, days: 7, available: null };

// Charts werden beim Umschalten ersetzt — alte Instanzen vorher zerstören
const charts = {};

function drawChart(id, config) {
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(document.getElementById(id), config);
}

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

function fmtHours(h) {
  if (h == null) return '–';
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh}h ${String(mm).padStart(2, '0')}m`;
}

function todayISO() {
  return new Date().toLocaleDateString('sv-SE');
}

function addDays(dateStr, delta) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function longDate(dateStr) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('de-DE', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

/** Achsenbeschriftung: bei kurzen Zeiträumen Wochentag, bei langen das Datum. */
function rangeLabel(dateStr, days) {
  const d = new Date(`${dateStr}T12:00:00`);
  if (days <= 14) return d.toLocaleDateString('de-DE', { weekday: 'short' });
  if (days <= 90) return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  return d.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });
}

function timeLabel(tsS) {
  return new Date(tsS * 1000).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function lineChart(canvasId, labels, data, color, opts = {}) {
  drawChart(canvasId, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: color,
        backgroundColor: color + '33',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        spanGaps: true,
      }],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { maxTicksLimit: 8 } },
        y: { beginAtZero: opts.beginAtZero !== false, suggestedMax: opts.max },
      },
    },
  });
}

// ---------- Statusleiste & Sync ----------

async function refreshStatus() {
  const statusEl = document.getElementById('status');
  try {
    const auth = await getJSON('/auth/status');
    const poller = auth.poller || {};

    if (poller.running) {
      statusEl.textContent = '⟳ Synchronisiere …';
      statusEl.className = 'status';
      return poller;
    }
    if (auth.connected) {
      const last = poller.lastSuccessAt
        ? ` · zuletzt ${new Date(poller.lastSuccessAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`
        : '';
      statusEl.textContent = `● Garmin verbunden${last}`;
      statusEl.className = 'status ok';
    } else {
      statusEl.textContent = '⚠ Nicht angemeldet — einmalig login.py ausführen';
      statusEl.title = 'docker exec -it garmin-health /opt/venv/bin/python3 /app/poller/login.py';
      statusEl.className = 'status warn';
    }
    return poller;
  } catch {
    return {}; // Status ist nice-to-have — Dashboard funktioniert auch ohne
  }
}

function setupSyncButton() {
  const button = document.getElementById('sync-btn');
  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = '⟳ …';
    try {
      const res = await fetch('/api/sync?days=2', { method: 'POST' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const statusEl = document.getElementById('status');
        statusEl.textContent = '⚠ ' + (body.error || `Sync fehlgeschlagen (${res.status})`);
        statusEl.className = 'status warn';
        return;
      }
      await Promise.all([loadDay(), loadRange(), refreshStatus()]);
    } finally {
      button.disabled = false;
      button.textContent = '⟳ Sync';
    }
  });
}

// ---------- Tagesansicht ----------

async function loadDay() {
  const [day, series] = await Promise.all([
    getJSON(`/api/day/${view.date}`),
    getJSON(`/api/series/${view.date}`),
  ]);

  document.getElementById('day-label').textContent = longDate(view.date);
  document.getElementById('day-picker').value = view.date;
  document.getElementById('day-next').disabled = view.date >= todayISO();

  const sleep = day.sleep;
  document.getElementById('kpi-sleep').textContent = fmtHours(sleep && sleep.durationHours);
  document.getElementById('kpi-sleep-score').textContent =
    sleep && sleep.score != null ? `Score ${sleep.score}` : '';
  document.getElementById('kpi-bb').textContent = day.bodyBatteryMorning ?? '–';
  document.getElementById('kpi-bb-now').textContent = series.bodyBattery.length
    ? `zuletzt ${series.bodyBattery[series.bodyBattery.length - 1].value}`
    : '';
  document.getElementById('kpi-hrv').textContent =
    day.hrv && day.hrv.lastNightAvg != null ? `${day.hrv.lastNightAvg} ms` : '–';
  document.getElementById('kpi-steps').textContent =
    day.steps != null ? day.steps.toLocaleString('de-DE') : '–';
  document.getElementById('kpi-rhr').textContent =
    day.restingHr != null ? `Ruhepuls ${day.restingHr} bpm` : '';
  document.getElementById('kpi-stress').textContent = day.avgStress ?? '–';
  document.getElementById('kpi-stress-max').textContent =
    day.maxStress != null ? `max ${day.maxStress}` : '';
  document.getElementById('kpi-vo2').textContent = day.vo2max ?? '–';

  if (sleep) {
    drawChart('chart-sleep', {
      type: 'doughnut',
      data: {
        labels: ['Tief', 'Leicht', 'REM', 'Wach'],
        datasets: [{
          data: [sleep.deepMin ?? 0, sleep.lightMin ?? 0, sleep.remMin ?? 0, sleep.awakeMin ?? 0],
          backgroundColor: [COLORS.deep, COLORS.light, COLORS.rem, COLORS.awake],
          borderColor: '#171c26',
        }],
      },
      options: {
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.raw} min` } },
        },
      },
    });
  } else if (charts['chart-sleep']) {
    charts['chart-sleep'].destroy();
    delete charts['chart-sleep'];
  }

  lineChart('chart-bb', series.bodyBattery.map((r) => timeLabel(r.ts_s)),
    series.bodyBattery.map((r) => r.value), COLORS.accent, { max: 100 });
  lineChart('chart-stress', series.stress.map((r) => timeLabel(r.ts_s)),
    series.stress.map((r) => r.value), COLORS.stress, { max: 100 });
}

// ---------- Verlauf ----------

async function loadRange() {
  const range = await getJSON(`/api/range?days=${view.days}&end=${view.date}`);
  const labels = range.map((d) => rangeLabel(d.date, view.days));
  const suffix = view.days === 365 ? '1 Jahr' : `${view.days} Tage`;

  document.getElementById('title-sleep7').textContent = `Schlafdauer — ${suffix}`;
  document.getElementById('title-hrv7').textContent = `HRV — ${suffix}`;
  document.getElementById('title-steps7').textContent = `Schritte — ${suffix}`;

  drawChart('chart-sleep7', {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Tief', data: range.map((d) => (d.sleep?.deepMin ?? 0) / 60), backgroundColor: COLORS.deep, stack: 's' },
        { label: 'Leicht', data: range.map((d) => (d.sleep?.lightMin ?? 0) / 60), backgroundColor: COLORS.light, stack: 's' },
        { label: 'REM', data: range.map((d) => (d.sleep?.remMin ?? 0) / 60), backgroundColor: COLORS.rem, stack: 's' },
      ],
    },
    options: {
      plugins: { legend: { position: 'bottom' } },
      scales: {
        x: { ticks: { maxTicksLimit: 12 } },
        y: { title: { display: true, text: 'Stunden' } },
      },
    },
  });

  lineChart('chart-hrv7', labels, range.map((d) => d.hrv?.lastNightAvg ?? null), COLORS.rem, { beginAtZero: false });

  drawChart('chart-steps7', {
    type: 'bar',
    data: { labels, datasets: [{ data: range.map((d) => d.steps ?? 0), backgroundColor: COLORS.steps }] },
    options: {
      plugins: { legend: { display: false } },
      scales: { x: { ticks: { maxTicksLimit: 12 } } },
    },
  });
}

// ---------- Bedienelemente ----------

function setupControls() {
  const picker = document.getElementById('day-picker');

  const goTo = async (date) => {
    view.date = date;
    await Promise.all([loadDay(), loadRange()]);
  };

  picker.addEventListener('change', () => picker.value && goTo(picker.value));
  document.getElementById('day-prev').addEventListener('click', () => goTo(addDays(view.date, -1)));
  document.getElementById('day-next').addEventListener('click', () => {
    if (view.date < todayISO()) goTo(addDays(view.date, 1));
  });
  document.getElementById('day-today').addEventListener('click', () => goTo(todayISO()));

  document.querySelectorAll('#range-buttons button').forEach((button) => {
    button.addEventListener('click', async () => {
      document.querySelectorAll('#range-buttons button').forEach((b) => b.classList.remove('active'));
      button.classList.add('active');
      view.days = Number(button.dataset.days);
      await loadRange();
    });
  });
}

async function main() {
  document.getElementById('updated').textContent = new Date().toLocaleTimeString('de-DE');

  view.date = todayISO();
  try {
    view.available = await getJSON('/api/available');
    const picker = document.getElementById('day-picker');
    picker.max = view.available.today;
    if (view.available.firstDate) picker.min = view.available.firstDate;

    const note = document.getElementById('history-note');
    if (view.available.days > 0) {
      note.textContent =
        `Gespeicherte Historie: ${view.available.days} Tage (${longDate(view.available.firstDate)} bis ${longDate(view.available.lastDate)}). ` +
        'Weiter zurück nachladen: sync.py --days N';
    } else {
      note.textContent = 'Noch keine Daten gespeichert — einmal synchronisieren: sync.py --days 7';
    }
  } catch { /* Historie-Info ist optional */ }

  await refreshStatus();
  setupSyncButton();
  setupControls();
  await Promise.all([loadDay(), loadRange()]);
}

main().catch((err) => {
  const statusEl = document.getElementById('status');
  statusEl.textContent = '⚠ ' + err.message;
  statusEl.className = 'status warn';
});
