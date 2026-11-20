require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY));

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: { directives: { 'upgrade-insecure-requests': process.env.COOKIE_SECURE === 'true' ? [] : null } },
}));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api', require('./routes'));

require('./middleware/serveFrontend')(app);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
