'use strict';

const fs = require('fs');
const fsp = require('fs/promises');

/**
 * Datei als Blob für FormData – ohne sie komplett in den RAM zu laden,
 * sofern die Node-Version fs.openAsBlob kennt (>= 20.10).
 */
async function fileBlob(filePath, type = 'application/octet-stream') {
  if (typeof fs.openAsBlob === 'function') {
    return fs.openAsBlob(filePath, { type });
  }
  const buf = await fsp.readFile(filePath);
  return new Blob([buf], { type });
}

module.exports = { fileBlob };
