const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-development-secret';
const DATABASE_URL = String(process.env.DATABASE_URL || '').trim();

fs.mkdirSync(DATA_DIR, { recursive: true });

let cache = { users: {}, resets: {} };
let pool = null;
let persistQueue = Promise.resolve();
let storageMode = DATABASE_URL ? 'postgres' : 'local-file';

function readFileDb() {
  if (!fs.existsSync(DB_FILE)) return { users: {}, resets: {} };
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch { return { users: {}, resets: {} }; }
}

function writeFileDb(db) {
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

function normalizeEmail(v) { return String(v || '').trim().toLowerCase(); }
function normalizeUsername(v) { return String(v || '').trim().toLowerCase(); }
function publicUser(u) {
  return { id: u.id, first: u.firstName, last: u.lastName, email: u.email, username: u.username, createdAt: u.createdAt };
}
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
}
function verifyPassword(password, stored) {
  const [salt, key] = String(stored).split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(key, 'hex'), b = Buffer.from(derived, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function sign(user) { return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '8h' }); }

async function initializeDb() {
  if (!DATABASE_URL) {
    cache = readFileDb();
    let changed = false;
    for (const u of Object.values(cache.users || {})) {
      if (!u.account) u.account = { type: 'Everyday Checking', number: '•••• 4821', balance: 4560894.03 };
      if (u.account.type !== 'Everyday Checking') { u.account.type = 'Everyday Checking'; changed = true; }
    }
    if (changed) writeFileDb(cache);
    storageMode = 'local-file';
    return;
  }

  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cape_users (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      account JSONB NOT NULL,
      transactions JSONB NOT NULL DEFAULT '[]'::jsonb
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cape_resets (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at BIGINT NOT NULL
    )
  `);

  const result = await pool.query('SELECT * FROM cape_users ORDER BY created_at ASC');
  const users = {};
  for (const row of result.rows) {
    users[row.id] = {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      username: row.username,
      passwordHash: row.password_hash,
      createdAt: new Date(row.created_at).toISOString(),
      account: row.account || { type: 'Everyday Checking', number: '•••• 4821', balance: 4560894.03 },
      transactions: row.transactions || []
    };
  }

  const resetResult = await pool.query('SELECT token, user_id, expires_at FROM cape_resets');
  const resets = {};
  for (const row of resetResult.rows) resets[row.token] = { userId: row.user_id, expiresAt: Number(row.expires_at) };

  cache = { users, resets };

  // One-time migration if an older JSON database contains accounts.
  if (!Object.keys(users).length) {
    const old = readFileDb();
    if (Object.keys(old.users || {}).length) {
      cache = old;
      await persistToPostgres(cache);
    }
  }
  let accountLabelChanged = false;
  for (const u of Object.values(cache.users || {})) {
    if (!u.account) u.account = { type: 'Everyday Checking', number: '•••• 4821', balance: 4560894.03 };
    if (u.account.type !== 'Everyday Checking') { u.account.type = 'Everyday Checking'; accountLabelChanged = true; }
  }
  if (accountLabelChanged) await persistToPostgres(cache);
  storageMode = 'postgres';
}

async function persistToPostgres(db) {
  if (!pool) return;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM cape_users');
    await client.query('DELETE FROM cape_resets');
    for (const u of Object.values(db.users || {})) {
      await client.query(
        `INSERT INTO cape_users
         (id, first_name, last_name, email, username, password_hash, created_at, account, transactions)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb)`,
        [u.id, u.firstName, u.lastName, u.email, u.username, u.passwordHash, u.createdAt,
         JSON.stringify(u.account || {}), JSON.stringify(u.transactions || [])]
      );
    }
    for (const [token, r] of Object.entries(db.resets || {})) {
      await client.query(
        'INSERT INTO cape_resets (token,user_id,expires_at) VALUES ($1,$2,$3)',
        [token, r.userId, r.expiresAt]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

function readDb() { return cache; }

function writeDb(db) {
  cache = db;
  if (!pool) {
    writeFileDb(db);
    return;
  }
  persistQueue = persistQueue
    .then(() => persistToPostgres(db))
    .catch(err => console.error('CAPE BANK database persistence error:', err));
}

function getStorageMode() { return storageMode; }

module.exports = {
  initializeDb,
  readDb,
  writeDb,
  normalizeEmail,
  normalizeUsername,
  publicUser,
  hashPassword,
  verifyPassword,
  sign,
  DB_FILE,
  getStorageMode
};
