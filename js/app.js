/* Goldwörter – Türkisch Vokabeltrainer
   Vanilla JS, keine Abhängigkeiten. Daten: js/data.js (WORDS). */
"use strict";

// ---------------------------------------------------------------- Konstanten
const STORE_KEY = "goldwoerter_v1";
const INTERVALS = [0, 1, 2, 4, 8, 16, 32, 64]; // Tage pro Leitner-Box (Index = Box)
const MASTER_BOX = 5;
const SESSION_SIZE = 10;
const NEW_PER_SESSION = 8;
const GOLD_MC = 10;
const GOLD_TYPE = 15;
const GOLD_BLITZ = 5;

const LEVELS = [
  [0, "Çaylak", "Frischling"],
  [100, "Acemi", "Anfänger"],
  [250, "Öğrenci", "Schüler"],
  [500, "Çırak", "Lehrling"],
  [1000, "Kalfa", "Geselle"],
  [2000, "Usta", "Meister"],
  [3500, "Uzman", "Experte"],
  [5500, "Şampiyon", "Champion"],
  [8000, "Kahraman", "Held"],
  [12000, "Efsane", "Legende"],
  [17000, "Padişah", "Sultan"],
];

const ACHIEVEMENTS = [
  { id: "first", ico: "🥇", name: "İlk adım", desc: "Erste richtige Antwort", gold: 10, test: (s) => s.stats.correctTotal >= 1 },
  { id: "words25", ico: "📚", name: "25 Wörter", desc: "25 Wörter im Training", gold: 25, test: (s) => countLearning(s) >= 25 },
  { id: "words100", ico: "🎓", name: "100 Wörter", desc: "100 Wörter im Training", gold: 50, test: (s) => countLearning(s) >= 100 },
  { id: "words250", ico: "🏛️", name: "250 Wörter", desc: "250 Wörter im Training", gold: 100, test: (s) => countLearning(s) >= 250 },
  { id: "words500", ico: "🚀", name: "500 Wörter", desc: "500 Wörter im Training", gold: 200, test: (s) => countLearning(s) >= 500 },
  { id: "master25", ico: "⭐", name: "25 gemeistert", desc: "25 Wörter in Box 5+", gold: 50, test: (s) => countMastered(s) >= 25 },
  { id: "master100", ico: "🌟", name: "100 gemeistert", desc: "100 Wörter in Box 5+", gold: 150, test: (s) => countMastered(s) >= 100 },
  { id: "shaky10", ico: "🧠", name: "Langzeitgedächtnis", desc: "10 Wackelkandidaten gefestigt", gold: 100, test: (s) => (s.stats.shakyMastered || 0) >= 10 },
  { id: "combo10", ico: "🔥", name: "10er-Combo", desc: "10 richtige am Stück", gold: 30, test: (s) => s.stats.bestCombo >= 10 },
  { id: "combo25", ico: "☄️", name: "25er-Combo", desc: "25 richtige am Stück", gold: 75, test: (s) => s.stats.bestCombo >= 25 },
  { id: "streak3", ico: "🗓️", name: "3 Tage", desc: "3 Tage in Folge gelernt", gold: 30, test: (s) => s.streak.days >= 3 },
  { id: "streak7", ico: "🔥", name: "1 Woche", desc: "7 Tage in Folge gelernt", gold: 70, test: (s) => s.streak.days >= 7 },
  { id: "streak30", ico: "🏆", name: "1 Monat", desc: "30 Tage in Folge gelernt", gold: 300, test: (s) => s.streak.days >= 30 },
  { id: "gold1000", ico: "🪙", name: "1.000 Gold", desc: "1.000 Goldstücke verdient", gold: 100, test: (s) => s.xp >= 1000 },
  { id: "cov50", ico: "🇹🇷", name: "50 % Abdeckung", desc: "50 % der Alltagssprache", gold: 50, test: (s) => coverage(s) >= 50 },
  { id: "cov65", ico: "🌍", name: "65 % Abdeckung", desc: "65 % der Alltagssprache", gold: 100, test: (s) => coverage(s) >= 65 },
  { id: "cov75", ico: "👑", name: "75 % Abdeckung", desc: "75 % der Alltagssprache", gold: 200, test: (s) => coverage(s) >= 75 },
];

// ---------------------------------------------------------------- State
let S = load();
const byTr = new Map(WORDS.map((w) => [w.tr, w]));

function defaultState() {
  return {
    gold: 0,
    xp: 0,
    streak: { last: null, days: 0 },
    words: {}, // tr -> {box, due, c, w, known}
    settings: { lang: "de", tts: true },
    ach: [],
    stats: { answered: 0, correctTotal: 0, bestCombo: 0, sessions: 0, shakyMastered: 0 },
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaultState();
    const s = Object.assign(defaultState(), JSON.parse(raw));
    s.streak = Object.assign({ last: null, days: 0 }, s.streak);
    s.settings = Object.assign({ lang: "de", tts: true }, s.settings);
    s.stats = Object.assign(defaultState().stats, s.stats);
    return s;
  } catch (e) {
    return defaultState();
  }
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(S));
}

// ---------------------------------------------------------------- Helpers
const $ = (sel, el) => (el || document).querySelector(sel);
const app = $("#app");

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function trans(w) {
  return S.settings.lang === "en" ? w.en : w.de;
}

function rec(tr) {
  return S.words[tr];
}

function countLearning(s) {
  return Object.values(s.words).filter((r) => !r.known && r.box >= 1).length;
}
function countMastered(s) {
  return Object.values(s.words).filter((r) => !r.known && r.box >= MASTER_BOX).length;
}
function countKnown(s) {
  return Object.values(s.words).filter((r) => r.known).length;
}
function countShaky(s) {
  return Object.values(s.words).filter((r) => r.shaky && !r.known).length;
}
function coverage(s) {
  let c = 0;
  for (const w of WORDS) {
    const r = s.words[w.tr];
    if (r && (r.known || r.box >= 1)) c += w.cov;
  }
  return c;
}

function dueWords() {
  const t = today();
  return WORDS.filter((w) => {
    const r = rec(w.tr);
    return r && !r.known && r.box >= 1 && r.due <= t;
  });
}

function newWords(n) {
  return WORDS.filter((w) => !rec(w.tr)).slice(0, n);
}

function levelInfo(xp) {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i][0]) idx = i;
  const cur = LEVELS[idx];
  const next = LEVELS[idx + 1];
  const pct = next ? Math.min(100, ((xp - cur[0]) / (next[0] - cur[0])) * 100) : 100;
  return { idx, name: cur[1], nameDe: cur[2], next, pct };
}

// ---------------------------------------------------------------- Belohnungen
function earnGold(n, anchorEl) {
  S.gold += n;
  S.xp += n;
  if (anchorEl) {
    const pop = document.createElement("div");
    pop.className = "goldpop";
    pop.textContent = `+${n} 🪙`;
    anchorEl.appendChild(pop);
    setTimeout(() => pop.remove(), 900);
  }
}

function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = msg;
  $("#toasts").appendChild(t);
  setTimeout(() => t.remove(), 3100);
}

function touchStreak() {
  const t = today();
  if (S.streak.last === t) return;
  const wasYesterday = S.streak.last === addDays(t, -1);
  S.streak.days = wasYesterday ? S.streak.days + 1 : 1;
  S.streak.last = t;
  const bonus = 20 + 5 * Math.min(S.streak.days, 10);
  S.gold += bonus;
  S.xp += bonus;
  toast(`🔥 Tag ${S.streak.days} in Folge! +${bonus} 🪙 Tagesbonus`);
}

function checkAchievements() {
  for (const a of ACHIEVEMENTS) {
    if (!S.ach.includes(a.id) && a.test(S)) {
      S.ach.push(a.id);
      S.gold += a.gold;
      S.xp += a.gold;
      toast(`${a.ico} Abzeichen: <b>${a.name}</b> (+${a.gold} 🪙)`);
    }
  }
}

// ---------------------------------------------------------------- TTS
let trVoice = null;
function pickVoice() {
  const voices = speechSynthesis.getVoices();
  trVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("tr")) || null;
}
if ("speechSynthesis" in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

function speak(text) {
  if (!S.settings.tts || !("speechSynthesis" in window)) return;
  const clean = text.split("(")[0].split("/")[0].trim();
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = "tr-TR";
  if (trVoice) u.voice = trVoice;
  u.rate = 0.85;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// ---------------------------------------------------------------- Quiz-Logik
function distractors(word, n) {
  const pool = [];
  const seenTexts = new Set([trans(word), word.tr]);
  const sorted = WORDS.filter((w) => w !== word).sort(
    (a, b) => Math.abs(a.i - word.i) - Math.abs(b.i - word.i)
  );
  for (const w of sorted) {
    const t = trans(w);
    if (seenTexts.has(t) || seenTexts.has(w.tr)) continue;
    seenTexts.add(t);
    seenTexts.add(w.tr);
    pool.push(w);
    if (pool.length >= 24) break;
  }
  shuffle(pool);
  return pool.slice(0, n);
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function gradeSRS(word, correct) {
  let r = rec(word.tr);
  if (!r) r = S.words[word.tr] = { box: 0, due: today(), c: 0, w: 0 };
  if (correct) {
    r.c++;
    r.box = Math.min(r.box + 1, INTERVALS.length - 1);
    r.due = addDays(today(), INTERVALS[r.box]);
    if (r.shaky && r.box >= MASTER_BOX) {
      delete r.shaky;
      S.stats.shakyMastered = (S.stats.shakyMastered || 0) + 1;
      S.gold += 20;
      S.xp += 20;
      toast(`🧠 „${esc(word.tr)}" sitzt jetzt im Langzeitgedächtnis! +20 🪙`);
    }
  } else {
    r.w++;
    r.box = 1;
    r.due = today();
  }
}

function registerAnswer(correct, session) {
  S.stats.answered++;
  if (correct) {
    S.stats.correctTotal++;
    session.correct++;
    session.combo++;
    if (session.combo > S.stats.bestCombo) S.stats.bestCombo = session.combo;
  } else {
    session.combo = 0;
  }
  touchStreak();
}

// ---------------------------------------------------------------- Views
function render(html) {
  app.innerHTML = html;
  window.scrollTo(0, 0);
}

function viewHome() {
  const due = dueWords().length;
  const lvl = levelInfo(S.xp);
  const cov = coverage(S);
  const fresh = newWords(1).length > 0;
  render(`
    <div class="topbar">
      <h1>Gold<span>wörter</span> 🪙</h1>
      <div class="statchips">
        <div class="chip gold">🪙 ${S.gold}</div>
        <div class="chip fire">🔥 ${S.streak.days}</div>
      </div>
    </div>

    <div class="levelcard">
      <div class="lvlrow">
        <div class="lvlname">${lvl.name} <span style="color:var(--muted);font-weight:400">· ${lvl.nameDe}</span></div>
        <div class="lvlsub">${lvl.next ? `${S.xp} / ${lvl.next[0]} XP` : "Max-Level!"}</div>
      </div>
      <div class="progress"><div style="width:${lvl.pct}%"></div></div>
    </div>

    <div class="covcard">
      <div class="covnum">${cov.toFixed(1).replace(".", ",")} %</div>
      <div class="covtext">der gesprochenen türkischen Alltagssprache kannst du theoretisch verstehen*</div>
      <div class="progress teal"><div style="width:${Math.min(100, cov)}%"></div></div>
      <div class="covrow">
        <div class="item"><b>${countLearning(S)}</b><span>im Training</span></div>
        <div class="item"><b>${countMastered(S)}</b><span>gemeistert ⭐</span></div>
        <div class="item"><b>${countKnown(S)}</b><span>schon gekonnt</span></div>
      </div>
    </div>

    <div class="menu">
      <button class="mbtn primary" id="btn-review" ${due === 0 ? "disabled" : ""}>
        <span class="ico">🔁</span>
        <span>Wiederholen<span class="sub">Spaced Repetition – fällige Wörter</span></span>
        ${due > 0 ? `<span class="badge">${due}</span>` : `<span class="badge green">0</span>`}
      </button>
      <button class="mbtn" id="btn-shaky" ${countShaky(S) === 0 ? "disabled" : ""}>
        <span class="ico">🧠</span>
        <span>Auffrischen<span class="sub">Wackelkandidaten aktiv abrufen (Deutsch → Türkisch)</span></span>
        ${countShaky(S) > 0 ? `<span class="badge shaky">${countShaky(S)}</span>` : ""}
      </button>
      <button class="mbtn" id="btn-new" ${fresh ? "" : "disabled"}>
        <span class="ico">✨</span>
        <span>Neue Wörter lernen<span class="sub">${NEW_PER_SESSION} neue Wörter nach Häufigkeit</span></span>
      </button>
      <button class="mbtn" id="btn-blitz" ${countLearning(S) + countKnown(S) < 4 ? "disabled" : ""}>
        <span class="ico">⚡</span>
        <span>Blitz-Quiz<span class="sub">Schnelle Runde, ohne SRS-Wertung</span></span>
      </button>
      <button class="mbtn" id="btn-type" ${countLearning(S) < 4 ? "disabled" : ""}>
        <span class="ico">⌨️</span>
        <span>Schreib-Modus<span class="sub">Deutsch → Türkisch tippen (+${GOLD_TYPE} 🪙)</span></span>
      </button>
      <button class="mbtn" id="btn-dict">
        <span class="ico">📖</span>
        <span>Wörterliste<span class="sub">${WORDS.length} Wörter · „kenne ich schon" markieren</span></span>
      </button>
      <button class="mbtn" id="btn-ach">
        <span class="ico">🏅</span>
        <span>Abzeichen<span class="sub">${S.ach.length} / ${ACHIEVEMENTS.length} freigeschaltet</span></span>
      </button>
      <button class="mbtn" id="btn-settings">
        <span class="ico">⚙️</span>
        <span>Einstellungen<span class="sub">Sprache, Aussprache, Backup</span></span>
      </button>
    </div>

    <div class="footer">
      *Schätzung auf Basis der Wortfrequenzen (OpenSubtitles-Korpus,
      <a href="https://github.com/hermitdave/FrequencyWords" target="_blank" rel="noopener">hermitdave/FrequencyWords</a>, lemmatisiert).
    </div>
  `);
  $("#btn-review").onclick = () => startSession("review");
  $("#btn-shaky").onclick = () => startSession("shaky");
  $("#btn-new").onclick = () => startSession("new");
  $("#btn-blitz").onclick = () => startSession("blitz");
  $("#btn-type").onclick = () => startSession("type");
  $("#btn-dict").onclick = () => viewDict();
  $("#btn-ach").onclick = () => viewAchievements();
  $("#btn-settings").onclick = () => viewSettings();
}

// ---------------------------------------------------------------- Sessions
function startSession(mode) {
  let queue = [];
  if (mode === "review") {
    queue = shuffle(dueWords().slice()).slice(0, SESSION_SIZE * 2).map((w) => ({ w, kind: "mc" }));
  } else if (mode === "new") {
    const fresh = newWords(NEW_PER_SESSION);
    queue = fresh.map((w) => ({ w, kind: "intro" }));
  } else if (mode === "blitz") {
    const pool = WORDS.filter((w) => {
      const r = rec(w.tr);
      return r && (r.known || r.box >= 1);
    });
    queue = shuffle(pool.slice()).slice(0, SESSION_SIZE).map((w) => ({ w, kind: "mc" }));
  } else if (mode === "shaky") {
    const pool = WORDS.filter((w) => {
      const r = rec(w.tr);
      return r && r.shaky && !r.known;
    });
    // Fällige zuerst, dann nach Rang
    const t = today();
    pool.sort((a, b) => {
      const ra = rec(a.tr), rb = rec(b.tr);
      const da = ra.due <= t ? 0 : 1, db = rb.due <= t ? 0 : 1;
      return da - db || a.r - b.r;
    });
    queue = pool.slice(0, SESSION_SIZE + 2).map((w, idx) => {
      const typable = /^[a-zA-ZçğıöşüÇĞİÖŞÜâîûÂÎÛ]+$/.test(w.tr) && rec(w.tr).box >= 2;
      return { w, kind: typable && idx % 3 === 2 ? "type" : "mc" };
    });
    shuffle(queue);
  } else if (mode === "type") {
    const pool = WORDS.filter((w) => {
      const r = rec(w.tr);
      return r && !r.known && r.box >= 1 && /^[a-zA-ZçğıöşüÇĞİÖŞÜâîûÂÎÛ]+$/.test(w.tr);
    });
    queue = shuffle(pool.slice()).slice(0, SESSION_SIZE).map((w) => ({ w, kind: "type" }));
  }
  if (queue.length === 0) return viewHome();

  const session = { mode, queue, pos: 0, correct: 0, total: 0, combo: 0, gold: 0, introduced: 0 };
  S.stats.sessions++;
  stepSession(session);
}

function stepSession(session) {
  if (session.pos >= session.queue.length) return viewSummary(session);
  const item = session.queue[session.pos];
  if (item.kind === "intro") viewIntro(session, item);
  else if (item.kind === "type") viewType(session, item);
  else viewMC(session, item);
}

function sessionBar(session) {
  const pct = (session.pos / session.queue.length) * 100;
  return `
    <div class="sessionbar">
      <button class="close" id="s-close">✕</button>
      <div class="progress"><div style="width:${pct}%"></div></div>
      ${session.combo >= 3 ? `<div class="combo">🔥×${session.combo}</div>` : ""}
      <div class="sgold">+${session.gold} 🪙</div>
    </div>`;
}

function bindClose() {
  $("#s-close").onclick = () => {
    save();
    checkAchievements();
    save();
    viewHome();
  };
}

// --- Neue Wörter: Vorstellungs-Karte
function viewIntro(session, item) {
  const w = item.w;
  render(`
    ${sessionBar(session)}
    <div class="qcard intro">
      <div class="qtype">Neues Wort · Häufigkeitsrang ${w.r}</div>
      <div class="qword">${esc(w.tr)}</div>
      <button class="speak" id="s-speak">🔊</button>
      <div class="meaning">${esc(trans(w))}</div>
      ${w.ex ? `<div class="qhint">Häufige Form im Alltag: <b>${esc(w.ex)}</b></div>` : ""}
      <div class="rankinfo">deckt ${w.cov.toFixed(2).replace(".", ",")} % aller gesprochenen Wörter ab</div>
    </div>
    <div class="introbtns">
      <button class="bigbtn secondary" id="s-known">✅ Kenne ich</button>
      <button class="bigbtn secondary" id="s-shakymark">🔄 Vergesse ich oft</button>
    </div>
    <div class="nextrow">
      <button class="bigbtn" id="s-learn">🎓 Lernen</button>
    </div>
  `);
  bindClose();
  speak(w.tr);
  $("#s-speak").onclick = () => speak(w.tr);
  $("#s-known").onclick = () => {
    S.words[w.tr] = { box: 0, due: today(), c: 0, w: 0, known: true };
    save();
    session.pos++;
    stepSession(session);
  };
  $("#s-shakymark").onclick = () => {
    S.words[w.tr] = { box: 1, due: today(), c: 0, w: 0, shaky: true };
    session.introduced++;
    session.queue.push({ w, kind: "mc" });
    save();
    session.pos++;
    stepSession(session);
  };
  $("#s-learn").onclick = () => {
    S.words[w.tr] = { box: 0, due: today(), c: 0, w: 0 };
    session.introduced++;
    // direkt danach abfragen: ans Ende der Queue eine MC-Frage hängen
    session.queue.push({ w, kind: "mc" });
    save();
    session.pos++;
    stepSession(session);
  };
}

// --- Multiple Choice
function viewMC(session, item) {
  const w = item.w;
  const wr = rec(w.tr);
  // Wackelkandidaten überwiegend aktiv abrufen: Deutsch -> Türkisch
  const trToDe = Math.random() < (wr && wr.shaky ? 0.25 : 0.55);
  const opts = shuffle([w, ...distractors(w, 3)]);
  const prompt = trToDe ? w.tr : trans(w);
  const qtype = trToDe
    ? `Was bedeutet …`
    : S.settings.lang === "en"
    ? `Wie heißt das auf Türkisch?`
    : `Wie heißt das auf Türkisch?`;

  render(`
    ${sessionBar(session)}
    <div class="qcard">
      <div class="qtype">${qtype}</div>
      <div class="qword">${esc(prompt)}</div>
      ${trToDe ? `<button class="speak" id="s-speak">🔊</button>` : ""}
      <div class="rankinfo">Häufigkeitsrang ${w.r}</div>
    </div>
    <div class="answers" id="answers">
      ${opts
        .map(
          (o, i) =>
            `<button class="abtn" data-i="${i}">${esc(trToDe ? trans(o) : o.tr)}</button>`
        )
        .join("")}
    </div>
    <div class="nextrow" id="nextrow"></div>
  `);
  bindClose();
  if (trToDe) {
    speak(w.tr);
    $("#s-speak").onclick = () => speak(w.tr);
  }

  let done = false;
  $("#answers").querySelectorAll(".abtn").forEach((btn) => {
    btn.onclick = () => {
      if (done) return;
      done = true;
      const chosen = opts[Number(btn.dataset.i)];
      const correct = chosen === w;
      $("#answers").querySelectorAll(".abtn").forEach((b, i) => {
        if (opts[i] === w) b.classList.add("correct");
        else if (b === btn) b.classList.add("wrong");
        else b.classList.add("dim");
      });
      const isSRS = session.mode !== "blitz";
      if (isSRS) gradeSRS(w, correct);
      registerAnswer(correct, session);
      if (correct) {
        const base = session.mode === "blitz" ? GOLD_BLITZ : GOLD_MC;
        const bonus = Math.floor(session.combo / 3) * 2;
        const g = base + bonus;
        session.gold += g;
        earnGold(g, $(".qcard"));
      } else if (isSRS && (session.mode === "review" || session.mode === "shaky")) {
        // falsch beantwortete Wörter kommen in der Session nochmal dran
        session.queue.push({ w, kind: "mc" });
      }
      if (!trToDe) speak(w.tr);
      save();
      const info = `
        <div class="wordinfo">
          <b>${esc(w.tr)}</b> – ${esc(w.de)}<br>
          <span class="sec">🇬🇧 ${esc(w.en)}${w.ex ? ` · häufige Form: ${esc(w.ex)}` : ""}</span>
        </div>
        <button class="bigbtn" id="s-next" style="margin-top:12px">Weiter</button>`;
      $("#nextrow").innerHTML = info;
      $("#s-next").onclick = () => {
        session.pos++;
        stepSession(session);
      };
      if (correct) {
        setTimeout(() => {
          const el = $("#s-next");
          if (el) el.click();
        }, 1400);
      }
    };
  });
}

// --- Schreib-Modus
function normalizeAnswer(s) {
  return s
    .toLocaleLowerCase("tr")
    .trim()
    .replace(/\s+/g, " ");
}

function asciiFold(s) {
  const map = { ç: "c", ğ: "g", ı: "i", i: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };
  return s.replace(/[çğıöşüâîû]/g, (c) => map[c] || c);
}

function viewType(session, item) {
  const w = item.w;
  render(`
    ${sessionBar(session)}
    <div class="qcard">
      <div class="qtype">Schreib das türkische Wort für:</div>
      <div class="qword">${esc(trans(w))}</div>
      <div class="rankinfo">Häufigkeitsrang ${w.r} · Box ${rec(w.tr) ? rec(w.tr).box : 0}</div>
    </div>
    <input class="typebox" id="typebox" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="türkisches Wort …">
    <div class="trkeys" id="trkeys">
      ${["ç", "ğ", "ı", "ö", "ş", "ü"].map((c) => `<button data-c="${c}">${c}</button>`).join("")}
    </div>
    <div class="nextrow">
      <button class="bigbtn" id="s-check">Prüfen</button>
    </div>
    <div id="result"></div>
  `);
  bindClose();
  const input = $("#typebox");
  input.focus();
  $("#trkeys").querySelectorAll("button").forEach((b) => {
    b.onclick = () => {
      input.value += b.dataset.c;
      input.focus();
    };
  });

  let done = false;
  const check = () => {
    if (done) return;
    const given = normalizeAnswer(input.value);
    if (!given) return;
    done = true;
    const target = normalizeAnswer(w.tr);
    const correct = given === target || asciiFold(given) === asciiFold(target);
    input.classList.add(correct ? "ok" : "bad");
    input.disabled = true;
    gradeSRS(w, correct);
    registerAnswer(correct, session);
    if (correct) {
      const g = GOLD_TYPE + Math.floor(session.combo / 3) * 2;
      session.gold += g;
      earnGold(g, $(".qcard"));
    }
    speak(w.tr);
    save();
    $("#result").innerHTML = `
      <div class="wordinfo">
        ${correct ? "✅ Richtig!" : `❌ Richtig wäre: <b>${esc(w.tr)}</b>`} – ${esc(w.de)}<br>
        <span class="sec">🇬🇧 ${esc(w.en)}</span>
      </div>
      <button class="bigbtn" id="s-next" style="margin-top:12px">Weiter</button>`;
    $("#s-check").style.display = "none";
    $("#s-next").onclick = () => {
      session.pos++;
      stepSession(session);
    };
  };
  $("#s-check").onclick = check;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (done) {
        const n = $("#s-next");
        if (n) n.click();
      } else check();
    }
  });
}

// --- Zusammenfassung
function viewSummary(session) {
  checkAchievements();
  save();
  const pct = session.correct + session.combo === 0 && session.correct === 0 ? 0 : session.correct;
  const answered = session.queue.filter((q) => q.kind !== "intro").length;
  const emoji = answered === 0 ? "📚" : session.correct / Math.max(1, answered) >= 0.8 ? "🎉" : session.correct / Math.max(1, answered) >= 0.5 ? "💪" : "🌱";
  render(`
    <div class="summary">
      <div class="big">${emoji}</div>
      <h2>Runde geschafft!</h2>
      <div class="sub">${session.mode === "new" ? `${session.introduced} neue Wörter im Training` : "Weiter so – jeden Tag ein bisschen!"}</div>
      <div class="sumgrid">
        <div class="sumitem"><b>${session.correct} / ${answered}</b><span>richtig</span></div>
        <div class="sumitem gold"><b>+${session.gold}</b><span>Goldstücke 🪙</span></div>
        <div class="sumitem"><b>${coverage(S).toFixed(1).replace(".", ",")} %</b><span>Abdeckung</span></div>
        <div class="sumitem"><b>🔥 ${S.streak.days}</b><span>Tage-Streak</span></div>
      </div>
      <button class="bigbtn" id="s-home">Zur Übersicht</button>
    </div>
  `);
  $("#s-home").onclick = viewHome;
}

// ---------------------------------------------------------------- Wörterliste
let dictFilter = "alle";
let dictQuery = "";
let dictLimit = 60;

function viewDict() {
  render(`
    <button class="backbtn" id="back">← Zurück</button>
    <h2 class="pagetitle">📖 Wörterliste</h2>
    <input class="searchbox" id="dsearch" placeholder="Suchen (Türkisch oder Deutsch) …" value="${esc(dictQuery)}">
    <div class="tabs" id="dtabs">
      ${["alle", "neu", "training", "wackelig", "gemeistert", "bekannt"]
        .map((t) => `<button data-t="${t}" class="${dictFilter === t ? "active" : ""}">${t[0].toUpperCase() + t.slice(1)}</button>`)
        .join("")}
    </div>
    <div id="dlist"></div>
  `);
  $("#back").onclick = viewHome;
  $("#dsearch").oninput = (e) => {
    dictQuery = e.target.value;
    dictLimit = 60;
    renderDictList();
  };
  $("#dtabs").querySelectorAll("button").forEach((b) => {
    b.onclick = () => {
      dictFilter = b.dataset.t;
      dictLimit = 60;
      viewDict();
    };
  });
  renderDictList();
}

function wordStatus(w) {
  const r = rec(w.tr);
  if (!r) return ["neu", "Neu", ""];
  if (r.known) return ["bekannt", "Bekannt ✓", "s-known"];
  if (r.shaky) {
    const due = r.due <= today();
    return ["wackelig", due ? "🔄 fällig" : `🔄 Box ${r.box}`, "s-shaky"];
  }
  if (r.box >= MASTER_BOX) return ["gemeistert", `Box ${r.box} ⭐`, "s-master"];
  if (r.box >= 1) {
    const due = r.due <= today();
    return ["training", due ? `fällig · Box ${r.box}` : `Box ${r.box}`, due ? "s-due" : "s-learn"];
  }
  return ["training", "lernt", "s-learn"];
}

function renderDictList() {
  const q = dictQuery.toLocaleLowerCase("tr");
  const list = WORDS.filter((w) => {
    const [cat] = wordStatus(w);
    if (dictFilter !== "alle" && cat !== dictFilter) return false;
    if (!q) return true;
    return (
      w.tr.toLocaleLowerCase("tr").includes(q) ||
      w.de.toLowerCase().includes(q) ||
      w.en.toLowerCase().includes(q)
    );
  });
  const shown = list.slice(0, dictLimit);
  $("#dlist").innerHTML =
    shown
      .map((w) => {
        const [, label, cls] = wordStatus(w);
        const r = rec(w.tr);
        const known = r && r.known;
        const shaky = r && r.shaky;
        return `
        <div class="wrow">
          <button class="knownbtn ${known ? "on" : ""}" data-tr="${esc(w.tr)}" title="kenne ich schon">✅</button>
          <button class="knownbtn ${shaky ? "on" : ""}" data-shaky="${esc(w.tr)}" title="kenne ich, vergesse ich aber oft">🔄</button>
          <div class="grow">
            <div class="wtr">${esc(w.tr)} <span style="color:#6c6488;font-weight:400;font-size:0.75rem">#${w.r}</span></div>
            <div class="wde">${esc(w.de)}</div>
          </div>
          <span class="status ${cls}">${label}</span>
          <button class="knownbtn on" data-speak="${esc(w.tr)}">🔊</button>
        </div>`;
      })
      .join("") +
    (list.length > dictLimit
      ? `<button class="bigbtn secondary loadmore" id="dmore">Mehr anzeigen (${list.length - dictLimit})</button>`
      : "");
  $("#dlist").querySelectorAll("[data-tr]").forEach((b) => {
    b.onclick = () => {
      const tr = b.dataset.tr;
      const r = rec(tr);
      if (r && r.known) delete S.words[tr];
      else S.words[tr] = { box: 0, due: today(), c: 0, w: 0, known: true };
      checkAchievements();
      save();
      renderDictList();
    };
  });
  $("#dlist").querySelectorAll("[data-shaky]").forEach((b) => {
    b.onclick = () => {
      const tr = b.dataset.shaky;
      const r = rec(tr);
      if (r && r.shaky) {
        delete r.shaky;
      } else {
        const prev = r || { box: 0, due: today(), c: 0, w: 0 };
        prev.box = Math.max(prev.box, 1);
        prev.due = today();
        delete prev.known;
        prev.shaky = true;
        S.words[tr] = prev;
      }
      checkAchievements();
      save();
      renderDictList();
    };
  });
  $("#dlist").querySelectorAll("[data-speak]").forEach((b) => {
    b.onclick = () => speak(b.dataset.speak);
  });
  const more = $("#dmore");
  if (more)
    more.onclick = () => {
      dictLimit += 100;
      renderDictList();
    };
}

// ---------------------------------------------------------------- Abzeichen
function viewAchievements() {
  render(`
    <button class="backbtn" id="back">← Zurück</button>
    <h2 class="pagetitle">🏅 Abzeichen</h2>
    <div class="achgrid">
      ${ACHIEVEMENTS.map((a) => {
        const got = S.ach.includes(a.id);
        return `<div class="ach ${got ? "" : "locked"}">
          <div class="aico">${a.ico}</div>
          <b>${a.name}</b>
          <span>${a.desc}<br>+${a.gold} 🪙</span>
        </div>`;
      }).join("")}
    </div>
  `);
  $("#back").onclick = viewHome;
}

// ---------------------------------------------------------------- Einstellungen
function viewSettings() {
  render(`
    <button class="backbtn" id="back">← Zurück</button>
    <h2 class="pagetitle">⚙️ Einstellungen</h2>
    <div class="setrow">
      <div class="lbl"><b>Übersetzungssprache</b><span>Sprache der Abfrage</span></div>
      <select id="set-lang">
        <option value="de" ${S.settings.lang === "de" ? "selected" : ""}>Deutsch</option>
        <option value="en" ${S.settings.lang === "en" ? "selected" : ""}>Englisch</option>
      </select>
    </div>
    <div class="setrow">
      <div class="lbl"><b>Aussprache (TTS)</b><span>Wörter automatisch vorlesen</span></div>
      <button class="switch ${S.settings.tts ? "on" : ""}" id="set-tts"></button>
    </div>
    <div class="setrow">
      <div class="lbl"><b>Fortschritt exportieren</b><span>Backup als JSON-Datei</span></div>
      <button class="bigbtn secondary" style="padding:9px 14px" id="set-export">Export</button>
    </div>
    <div class="setrow">
      <div class="lbl"><b>Fortschritt importieren</b><span>JSON-Backup laden</span></div>
      <button class="bigbtn secondary" style="padding:9px 14px" id="set-import">Import</button>
      <input type="file" id="set-file" accept=".json" style="display:none">
    </div>
    <div class="setrow">
      <div class="lbl"><b>Zurücksetzen</b><span>Löscht den gesamten Fortschritt</span></div>
      <button class="dangerbtn" id="set-reset">Alles löschen</button>
    </div>
    <div class="footer">
      Goldwörter · Frequenzdaten: OpenSubtitles via
      <a href="https://github.com/hermitdave/FrequencyWords" target="_blank" rel="noopener">hermitdave/FrequencyWords</a>
      · ${WORDS.length} kuratierte Lemmata
    </div>
  `);
  $("#back").onclick = viewHome;
  $("#set-lang").onchange = (e) => {
    S.settings.lang = e.target.value;
    save();
  };
  $("#set-tts").onclick = () => {
    S.settings.tts = !S.settings.tts;
    save();
    viewSettings();
  };
  $("#set-export").onclick = () => {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `goldwoerter-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  $("#set-import").onclick = () => $("#set-file").click();
  $("#set-file").onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.words || !data.settings) throw new Error("kein Goldwörter-Backup");
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
        S = load();
        toast("✅ Backup importiert");
        viewHome();
      } catch (err) {
        toast("❌ Import fehlgeschlagen");
      }
    };
    reader.readAsText(file);
  };
  $("#set-reset").onclick = () => {
    if (confirm("Wirklich den GESAMTEN Fortschritt löschen?")) {
      localStorage.removeItem(STORE_KEY);
      S = load();
      viewHome();
    }
  };
}

// ---------------------------------------------------------------- Start
viewHome();
