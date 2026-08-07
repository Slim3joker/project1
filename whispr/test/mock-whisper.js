'use strict';

/**
 * Mini-Nachbau der ASR-Webservice-API für den End-to-End-Test:
 * nimmt einen Upload entgegen und liefert ein festes Segment-JSON zurück.
 */
const http = require('http');

function start(port = 0) {
  const server = http.createServer((req, res) => {
    if (req.url.startsWith('/docs')) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end('<html>ok</html>');
    }
    if (!req.url.startsWith('/asr')) {
      res.writeHead(404);
      return res.end();
    }
    let bytes = 0;
    req.on('data', (chunk) => { bytes += chunk.length; });
    req.on('end', () => {
      const payload = {
        text: 'Hallo, das ist ein Test. Wir sprechen über Transkription. Danach folgt ein zweiter Gedanke.',
        language: 'de',
        segments: [
          { start: 0.0, end: 2.4, text: ' Hallo, das ist ein Test.' },
          { start: 2.4, end: 5.9, text: ' Wir sprechen über Transkription.' },
          { start: 12.0, end: 15.5, text: ' Danach folgt ein zweiter Gedanke.' },
        ],
        receivedBytes: bytes,
      };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(payload));
    });
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

module.exports = { start };
