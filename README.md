# CAPE BANK — persistent authentication prototype

This is a fictional banking prototype. It does not connect to real funds or real banking systems.

## Persistent signup/login
The API now supports Render Postgres. When `DATABASE_URL` is present, user accounts, password hashes, account data, transactions, and reset records are stored in Postgres instead of Render's ephemeral filesystem.

Passwords are **never stored in plaintext**. They are salted and hashed with Node `scrypt` before storage.

### One-time Render setup
1. In Render Dashboard choose **New → Postgres**.
2. Create the database.
3. Open the CAPE BANK web service → **Environment**.
4. Add `DATABASE_URL` using the Postgres database's internal connection string.
5. Keep `JWT_SECRET` set.
6. Save/deploy.

After the deploy, the API creates its tables automatically. New accounts will survive browser sessions, Render restarts, and web-service redeploys because the account records live in Postgres.

If the Postgres database is empty, create the account once after the database is connected. The old JSON storage was on Render's ephemeral filesystem and cannot be recovered after it has been discarded.

Render's free Postgres is intended for testing and currently expires after 30 days; use a paid Postgres instance for long-term persistence. See Render's current datastore documentation for plan limits.

## Local development
Set `DATABASE_URL` and `JWT_SECRET`, then run:

```bash
npm install
npm start
```

Without `DATABASE_URL`, the app falls back to local `api/data/db.json` for development only.
