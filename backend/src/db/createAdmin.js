require('dotenv').config();
const readline = require('readline');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
let muted = false;
rl._writeToOutput = (s) => {
  if (!muted) rl.output.write(s);
  else if (s.includes('\n')) rl.output.write('\n');
};

const ask = (q, hidden = false) => new Promise((resolve) => {
  rl.question(q, (a) => { muted = false; resolve(a.trim()); });
  muted = hidden;
});

(async () => {
  const name = await ask('Name: ');
  const email = (await ask('Email: ')).toLowerCase();
  const password = await ask('Password (min 12 chars): ', true);
  const confirm = await ask('Confirm password: ', true);
  rl.close();

  if (!name || !/^\S+@\S+\.\S+$/.test(email)) throw new Error('Invalid name or email');
  if (password.length < 12) throw new Error('Password must be at least 12 characters');
  if (password !== confirm) throw new Error('Passwords do not match');

  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    'INSERT INTO admins (name, email, password_hash) VALUES ($1, $2, $3)',
    [name, email, hash]);
  console.log('Admin created:', email);
  await pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
