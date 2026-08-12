'use strict';

/**
 * Minimale Warteschlange mit begrenzter Parallelität.
 * Auf einer GPU ist CONCURRENCY=1 richtig – mehrere Whisper-Läufe
 * gleichzeitig machen die Sache nur langsamer.
 */
class Queue {
  constructor(concurrency, worker) {
    this.concurrency = Math.max(1, concurrency);
    this.worker = worker;
    this.pending = [];
    this.active = 0;
  }

  push(item) {
    this.pending.push(item);
    this.drain();
  }

  /** Entfernt einen noch nicht gestarteten Job aus der Warteschlange. */
  cancelPending(predicate) {
    const before = this.pending.length;
    this.pending = this.pending.filter((item) => !predicate(item));
    return before !== this.pending.length;
  }

  get size() {
    return this.pending.length;
  }

  drain() {
    while (this.active < this.concurrency && this.pending.length) {
      const item = this.pending.shift();
      this.active += 1;
      Promise.resolve()
        .then(() => this.worker(item))
        .catch((err) => console.error('[queue] Worker-Fehler:', err))
        .finally(() => {
          this.active -= 1;
          this.drain();
        });
    }
  }
}

module.exports = { Queue };
