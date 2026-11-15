const router = require('express').Router();
const pool = require('../config/db');

router.get('/health', async (req, res) => {
  const { rows } = await pool.query('SELECT NOW() AS time');
  res.json({ status: 'ok', db_time: rows[0].time });
});

module.exports = router;
