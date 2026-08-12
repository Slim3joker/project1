'use strict';

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const MAX_JOBS = 300;

/**
 * Sehr schlanke Job-Datenbank: eine JSON-Datei, gepuffert geschrieben.
 * Damit überlebt die Liste einen Neustart des Containers – genau das, was
 * der In-Memory-Map der ersten Version gefehlt hat.
 */
class JobStore {
  constructor(file) {
    this.file = file;
    this.jobs = new Map();
    this.writeQueued = false;
    this.writing = null;
  }

  load() {
    try {
      const raw = fs.readFileSync(this.file, 'utf-8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const job of list) {
          // Beim Start laufende Jobs gab es nicht mehr – als abgebrochen markieren.
          if (job.status === 'running' || job.status === 'queued') {
            job.status = 'error';
            job.error = 'Server wurde neu gestartet, während der Job lief.';
            job.finishedAt = job.finishedAt || new Date().toISOString();
          }
          this.jobs.set(job.id, job);
        }
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.warn('[store] jobs.json konnte nicht gelesen werden:', err.message);
      }
    }
  }

  list() {
    return Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  get(id) {
    return this.jobs.get(id) || null;
  }

  put(job) {
    this.jobs.set(job.id, job);
    this.trim();
    this.save();
    return job;
  }

  update(id, patch) {
    const job = this.jobs.get(id);
    if (!job) return null;
    Object.assign(job, patch);
    this.save();
    return job;
  }

  remove(id) {
    const existed = this.jobs.delete(id);
    if (existed) this.save();
    return existed;
  }

  trim() {
    if (this.jobs.size <= MAX_JOBS) return;
    const sorted = this.list();
    for (const job of sorted.slice(MAX_JOBS)) this.jobs.delete(job.id);
  }

  /** Schreiben ist gepuffert: viele Statuswechsel -> wenige Datei-Writes. */
  save() {
    if (this.writeQueued) return;
    this.writeQueued = true;
    setTimeout(() => {
      this.writeQueued = false;
      this.flush().catch((err) => console.warn('[store] Speichern fehlgeschlagen:', err.message));
    }, 250);
  }

  async flush() {
    const payload = JSON.stringify(this.list(), null, 2);
    const tmp = `${this.file}.tmp`;
    await fsp.mkdir(path.dirname(this.file), { recursive: true });
    await fsp.writeFile(tmp, payload, 'utf-8');
    await fsp.rename(tmp, this.file);
  }
}

module.exports = { JobStore };
