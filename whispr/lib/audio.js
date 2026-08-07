'use strict';

const { execFile } = require('child_process');
const fsp = require('fs/promises');
const path = require('path');

function run(cmd, args, timeoutMs = 30 * 60 * 1000) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { timeout: timeoutMs, maxBuffer: 8 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        err.stderr = stderr;
        return reject(err);
      }
      resolve({ stdout, stderr });
    });
  });
}

let ffmpegChecked = null;
async function hasFfmpeg() {
  if (ffmpegChecked !== null) return ffmpegChecked;
  try {
    await run('ffmpeg', ['-version'], 15000);
    ffmpegChecked = true;
  } catch {
    ffmpegChecked = false;
  }
  return ffmpegChecked;
}

/** Dauer in Sekunden via ffprobe, oder null wenn ffprobe fehlt. */
async function probeDuration(file) {
  try {
    const { stdout } = await run(
      'ffprobe',
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file],
      30000
    );
    const seconds = parseFloat(String(stdout).trim());
    return Number.isFinite(seconds) ? seconds : null;
  } catch {
    return null;
  }
}

/** Auf mono/16 kHz Opus herunterrechnen – reicht für Whisper und spart ~90 % Größe. */
async function compressToOpus(input, output) {
  await run('ffmpeg', ['-y', '-i', input, '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'libopus', '-b:a', '16k', output]);
  return output;
}

/** Datei in Stücke von `seconds` Länge schneiden (verlustfrei, ohne Neucodierung). */
async function splitByTime(input, seconds, outDir) {
  await fsp.mkdir(outDir, { recursive: true });
  const ext = path.extname(input) || '.ogg';
  const pattern = path.join(outDir, `part-%04d${ext}`);
  await run('ffmpeg', [
    '-y', '-i', input,
    '-f', 'segment',
    '-segment_time', String(seconds),
    '-reset_timestamps', '1',
    '-c', 'copy',
    pattern,
  ]);
  const files = (await fsp.readdir(outDir))
    .filter((f) => f.startsWith('part-'))
    .sort()
    .map((f) => path.join(outDir, f));
  return files;
}

module.exports = { hasFfmpeg, probeDuration, compressToOpus, splitByTime, run };
