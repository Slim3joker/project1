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

function weekday(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'short' });
}

function timeLabel(tsS) {
  return new Date(tsS * 1000).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function lineChart(canvasId, labels, data, color, opts = {}) {
  new Chart(document.getElementById(canvasId), {
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
  if (!button) return;
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
      location.reload(); // frische Daten anzeigen
    } finally {
      button.disabled = false;
      button.textContent = '⟳ Sync';
    }
  });
}

async function main() {
  document.getElementById('updated').textContent = new Date().toLocaleTimeString('de-DE');

  await refreshStatus();
  setupSyncButton();

  const [range, seriesToday] = await Promise.all([
    getJSON('/api/range?days=7'),
    getJSON('/api/series/today'),
  ]);
  const today = range[range.length - 1];
  const lastSleep = [...range].reverse().find((d) => d.sleep) || today;

  // --- KPIs ---
  document.getElementById('kpi-sleep').textContent = fmtHours(lastSleep.sleep?.durationHours);
  document.getElementById('kpi-sleep-score').textContent =
    lastSleep.sleep?.score != null ? `Score ${lastSleep.sleep.score}` : '';
  document.getElementById('kpi-bb').textContent = today.bodyBatteryMorning ?? '–';
  const bbSeries = seriesToday.bodyBattery;
  if (bbSeries.length) {
    document.getElementById('kpi-bb-now').textContent =
      `aktuell ${bbSeries[bbSeries.length - 1].value}`;
  }
  document.getElementById('kpi-hrv').textContent =
    today.hrv?.lastNightAvg != null ? `${today.hrv.lastNightAvg} ms` : '–';
  document.getElementById('kpi-steps').textContent =
    today.steps != null ? today.steps.toLocaleString('de-DE') : '–';
  document.getElementById('kpi-rhr').textContent =
    today.restingHr != null ? `Ruhepuls ${today.restingHr} bpm` : '';
  document.getElementById('kpi-stress').textContent = today.avgStress ?? '–';
  document.getElementById('kpi-stress-max').textContent =
    today.maxStress != null ? `max ${today.maxStress}` : '';
  document.getElementById('kpi-vo2').textContent = today.vo2max ?? '–';

  // --- Schlafphasen (Donut) ---
  if (lastSleep.sleep) {
    const s = lastSleep.sleep;
    new Chart(document.getElementById('chart-sleep'), {
      type: 'doughnut',
      data: {
        labels: ['Tief', 'Leicht', 'REM', 'Wach'],
        datasets: [{
          data: [s.deepMin ?? 0, s.lightMin ?? 0, s.remMin ?? 0, s.awakeMin ?? 0],
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
  }

  // --- Tagesverläufe ---
  lineChart('chart-bb', bbSeries.map((r) => timeLabel(r.ts_s)), bbSeries.map((r) => r.value), COLORS.accent, { max: 100 });
  lineChart('chart-stress', seriesToday.stress.map((r) => timeLabel(r.ts_s)), seriesToday.stress.map((r) => r.value), COLORS.stress, { max: 100 });

  // --- 7-Tage-Charts ---
  const labels7 = range.map((d) => weekday(d.date));
  new Chart(document.getElementById('chart-sleep7'), {
    type: 'bar',
    data: {
      labels: labels7,
      datasets: [
        { label: 'Tief', data: range.map((d) => (d.sleep?.deepMin ?? 0) / 60), backgroundColor: COLORS.deep, stack: 's' },
        { label: 'Leicht', data: range.map((d) => (d.sleep?.lightMin ?? 0) / 60), backgroundColor: COLORS.light, stack: 's' },
        { label: 'REM', data: range.map((d) => (d.sleep?.remMin ?? 0) / 60), backgroundColor: COLORS.rem, stack: 's' },
      ],
    },
    options: {
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { title: { display: true, text: 'Stunden' } } },
    },
  });
  lineChart('chart-hrv7', labels7, range.map((d) => d.hrv?.lastNightAvg ?? null), COLORS.rem, { beginAtZero: false });
  new Chart(document.getElementById('chart-steps7'), {
    type: 'bar',
    data: { labels: labels7, datasets: [{ data: range.map((d) => d.steps ?? 0), backgroundColor: COLORS.steps }] },
    options: { plugins: { legend: { display: false } } },
  });
}

main().catch((err) => {
  document.getElementById('status').textContent = '⚠ ' + err.message;
  document.getElementById('status').className = 'status warn';
});
