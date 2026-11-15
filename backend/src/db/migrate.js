const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const type = process.argv[2] === 'seed' ? 'seeders' : 'migrations';

(async () => {
  const dir = path.join(__dirname, type);
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_history (
    name TEXT PRIMARY KEY, ran_at TIMESTAMPTZ DEFAULT NOW())`);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const key = `${type}/${file}`;
    const done = await pool.query('SELECT 1 FROM schema_history WHERE name=$1', [key]);
    if (done.rowCount) continue;
    await pool.query(fs.readFileSync(path.join(dir, file), 'utf8'));
    await pool.query('INSERT INTO schema_history(name) VALUES($1)', [key]);
    console.log('Ran', key);
  }
  await pool.end();
})().catch(e => { console.error(e.message); process.exit(1); });
