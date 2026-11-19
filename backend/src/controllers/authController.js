const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const DUMMY_HASH = bcrypt.hashSync('dummy-password', 12);

const cookieOpts = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === 'true'
    : process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

exports.login = async (req, res) => {
  const email = req.body.email.toLowerCase();
  const { rows } = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
  const admin = rows[0];
  const ok = await bcrypt.compare(req.body.password, admin ? admin.password_hash : DUMMY_HASH);
  if (!admin || !ok) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
    algorithm: 'HS256', expiresIn: '7d',
  });
  res.cookie('token', token, cookieOpts());
  await pool.query(
    `INSERT INTO activity_logs (admin_id, action, entity, entity_id, description)
     VALUES ($1, 'login', 'admin', $1, 'Admin logged in')`, [admin.id]);
  res.json({ admin: { id: admin.id, name: admin.name, email: admin.email } });
};

exports.logout = (req, res) => {
  res.clearCookie('token', { ...cookieOpts(), maxAge: undefined });
  res.json({ message: 'Logged out' });
};

exports.me = async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, name, email FROM admins WHERE id = $1', [req.admin.id]);
  if (!rows[0]) return res.status(401).json({ message: 'Not authenticated' });
  res.json({ admin: rows[0] });
};
