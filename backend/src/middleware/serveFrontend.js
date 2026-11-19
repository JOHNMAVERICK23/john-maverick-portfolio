const fs = require('fs');
const path = require('path');
const express = require('express');

const DIST = path.join(__dirname, '..', '..', '..', 'frontend', 'dist');

module.exports = (app) => {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) return;

  app.use(express.static(DIST, { index: false, maxAge: '1h' }));

  // SPA fallback: deep links like /admin/projects load the React app
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    if (path.extname(req.path)) return next(); // a missing file should 404, not return HTML
    res.sendFile(path.join(DIST, 'index.html'));
  });
};
