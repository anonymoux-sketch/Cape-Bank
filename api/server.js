const app = require('./app');
const { initializeDb, getStorageMode } = require('./lib/db');
const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('Set JWT_SECRET in production.');
  }
  await initializeDb();
  app.listen(PORT, HOST, () => console.log(`CAPE BANK API/web server listening on http://${HOST}:${PORT} using ${getStorageMode()} storage`));
}

start().catch(err => { console.error(err); process.exit(1); });
