const crypto = require('crypto');
const db = require('../db');

// Garmin Connect Developer Program: OAuth2 mit PKCE
const AUTHORIZE_URL = 'https://connect.garmin.com/oauth2Confirm';
const TOKEN_URL = 'https://diauth.garmin.com/di-oauth2-service/oauth/token';
const API_BASE = 'https://apis.garmin.com/wellness-api/rest';

const CLIENT_ID = process.env.GARMIN_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GARMIN_CLIENT_SECRET || '';
const REDIRECT_URI =
  process.env.GARMIN_REDIRECT_URI || 'https://health.erenstower.de/auth/garmin/callback';

function b64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Schritt 1: Authorize-URL bauen und PKCE-Verifier zum State speichern. */
function buildAuthorizeUrl() {
  const state = b64url(crypto.randomBytes(16));
  const verifier = b64url(crypto.randomBytes(32));
  const challenge = b64url(crypto.createHash('sha256').update(verifier).digest());

  db.prepare('INSERT INTO oauth_state (state, code_verifier) VALUES (?, ?)').run(state, verifier);
  db.prepare("DELETE FROM oauth_state WHERE created_at < datetime('now', '-1 hour')").run();

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    redirect_uri: REDIRECT_URI,
    state,
  });
  return `${AUTHORIZE_URL}?${params}`;
}

function saveTokens(tok) {
  const expiresAt = Math.floor(Date.now() / 1000) + (tok.expires_in || 0) - 60;
  db.prepare(`
    INSERT INTO oauth_tokens (id, access_token, refresh_token, expires_at_s, updated_at)
    VALUES (1, @access_token, @refresh_token, @expires_at_s, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      access_token = excluded.access_token,
      refresh_token = excluded.refresh_token,
      expires_at_s = excluded.expires_at_s,
      updated_at = datetime('now')
  `).run({
    access_token: tok.access_token,
    refresh_token: tok.refresh_token,
    expires_at_s: expiresAt,
  });
}

async function tokenRequest(params) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
  if (!res.ok) {
    throw new Error(`Garmin Token-Request fehlgeschlagen (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

/** Schritt 2: Callback — Code gegen Tokens tauschen. */
async function handleCallback(code, state) {
  const row = db.prepare('SELECT code_verifier FROM oauth_state WHERE state = ?').get(state);
  if (!row) throw new Error('Unbekannter oder abgelaufener OAuth-State.');
  db.prepare('DELETE FROM oauth_state WHERE state = ?').run(state);

  const tok = await tokenRequest({
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    code_verifier: row.code_verifier,
    redirect_uri: REDIRECT_URI,
  });
  saveTokens(tok);

  // Garmin-User-ID merken (identifiziert die Uhr in den Webhook-Payloads)
  try {
    const userRes = await apiFetch('/user/id');
    if (userRes && userRes.userId) {
      db.prepare('UPDATE oauth_tokens SET garmin_user_id = ? WHERE id = 1').run(userRes.userId);
    }
  } catch (err) {
    console.warn('User-ID konnte nicht geladen werden:', err.message);
  }
}

async function getAccessToken() {
  const row = db.prepare('SELECT * FROM oauth_tokens WHERE id = 1').get();
  if (!row || !row.refresh_token) return null;
  if (row.expires_at_s > Math.floor(Date.now() / 1000)) return row.access_token;

  const tok = await tokenRequest({
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: row.refresh_token,
  });
  saveTokens(tok);
  return tok.access_token;
}

/** Authentifizierter GET gegen die Wellness-API (für Ping-Callbacks & Backfill). */
async function apiFetch(pathOrUrl) {
  const token = await getAccessToken();
  if (!token) throw new Error('Nicht mit Garmin verbunden — erst /auth/garmin durchlaufen.');
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : API_BASE + pathOrUrl;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`Garmin API ${url} → ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

function status() {
  const row = db.prepare('SELECT garmin_user_id, expires_at_s, updated_at FROM oauth_tokens WHERE id = 1').get();
  return {
    connected: Boolean(row && row.garmin_user_id !== null && row.expires_at_s),
    garminUserId: row ? row.garmin_user_id : null,
    tokenUpdatedAt: row ? row.updated_at : null,
    clientConfigured: Boolean(CLIENT_ID && CLIENT_SECRET),
  };
}

module.exports = { buildAuthorizeUrl, handleCallback, apiFetch, status };
