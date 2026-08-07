'use strict';

const UMLAUTE = { ä: 'ae', ö: 'oe', ü: 'ue', Ä: 'ae', Ö: 'oe', Ü: 'ue', ß: 'ss' };

/** Dateinamen-tauglicher Slug, deutsche Sonderzeichen werden ausgeschrieben. */
function slugify(input, maxLen = 60) {
  const base = String(input || '')
    .replace(/[äöüÄÖÜß]/g, (c) => UMLAUTE[c])
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLen)
    .replace(/-+$/g, '');
  return base || 'transkript';
}

/** Sekunden -> "12:34" bzw. "1:02:03" */
function formatTime(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Menschenlesbare Dauer für das Frontmatter. */
function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '';
  return formatTime(seconds);
}

function yamlString(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function endsSentence(text) {
  return /[.!?…]["»«'’)\]]*$/.test(String(text).trim());
}

/**
 * Whisper liefert kurze Segmente (~5 s). Für lesbaren – und für ein LLM gut
 * verdaulichen – Text werden sie zu Absätzen gruppiert: neuer Absatz bei
 * längerer Sprechpause oder wenn ein Absatz lang genug ist und ein Satz endet.
 */
function toParagraphs(segments, { maxWords = 130, pauseBreak = 1.4, hardPause = 3 } = {}) {
  const paragraphs = [];
  let current = [];
  let words = 0;
  let prevEnd = null;

  for (const seg of segments) {
    const text = String(seg.text || '').trim();
    if (!text) continue;
    const gap = prevEnd === null ? 0 : Number(seg.start || 0) - prevEnd;
    const last = current[current.length - 1];
    const breakHere =
      current.length > 0 &&
      (gap >= hardPause ||
        (gap >= pauseBreak && endsSentence(last)) ||
        (words >= maxWords && endsSentence(last)));

    if (breakHere) {
      paragraphs.push(current.join(' '));
      current = [];
      words = 0;
    }
    current.push(text);
    words += text.split(/\s+/).length;
    prevEnd = Number(seg.end || seg.start || 0);
  }
  if (current.length) paragraphs.push(current.join(' '));
  return paragraphs;
}

/** Segmente zu Zeitmarken-Blöcken von ca. `blockSeconds` Länge bündeln. */
function toTimestampBlocks(segments, blockSeconds = 30) {
  const blocks = [];
  let current = null;

  for (const seg of segments) {
    const text = String(seg.text || '').trim();
    if (!text) continue;
    const start = Number(seg.start || 0);
    if (!current || start - current.start >= blockSeconds) {
      current = { start, parts: [] };
      blocks.push(current);
    }
    current.parts.push(text);
  }
  return blocks.map((b) => ({ start: b.start, text: b.parts.join(' ') }));
}

/**
 * Baut das fertige Markdown-Dokument.
 * `data`: { title, sourceFile, language, model, backend, duration, createdAt,
 *           tags[], segments[], text, notes }
 */
function buildMarkdown(data, options = {}) {
  const withTimestamps = options.timestamps !== false;
  const segments = Array.isArray(data.segments) ? data.segments : [];
  const paragraphs = segments.length
    ? toParagraphs(segments)
    : String(data.text || '')
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean);

  const front = [];
  front.push('---');
  front.push(`titel: ${yamlString(data.title || 'Transkript')}`);
  front.push(`quelle: ${yamlString(data.sourceFile || '')}`);
  if (data.duration || data.duration === 0) front.push(`dauer: ${yamlString(formatDuration(data.duration))}`);
  if (data.duration || data.duration === 0) front.push(`dauer_sekunden: ${Math.round(data.duration)}`);
  front.push(`sprache: ${yamlString(data.language || '')}`);
  front.push(`modell: ${yamlString(data.model || '')}`);
  front.push(`backend: ${yamlString(data.backend || '')}`);
  front.push(`transkribiert_am: ${yamlString(data.createdAt || new Date().toISOString())}`);
  front.push(`woerter: ${paragraphs.join(' ').split(/\s+/).filter(Boolean).length}`);
  if (Array.isArray(data.tags) && data.tags.length) {
    front.push(`tags: [${data.tags.map((t) => yamlString(t)).join(', ')}]`);
  }
  front.push('---');

  const body = [];
  body.push('');
  body.push(`# ${data.title || 'Transkript'}`);
  body.push('');
  if (data.notes) {
    body.push(`> ${String(data.notes).replace(/\n/g, '\n> ')}`);
    body.push('');
  }
  body.push('## Transkript');
  body.push('');
  body.push(paragraphs.length ? paragraphs.join('\n\n') : '_(kein Text erkannt)_');
  body.push('');

  if (withTimestamps && segments.length) {
    body.push('## Mit Zeitmarken');
    body.push('');
    for (const block of toTimestampBlocks(segments)) {
      body.push(`- **[${formatTime(block.start)}]** ${block.text}`);
    }
    body.push('');
  }

  return `${front.join('\n')}\n${body.join('\n')}`;
}

module.exports = { slugify, formatTime, formatDuration, toParagraphs, toTimestampBlocks, buildMarkdown };
