const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const pool = require('../config/db');
const validate = require('../validators/validate');
const c = require('../controllers/publicController');

router.get('/health', async (req, res) => {
  const { rows } = await pool.query('SELECT NOW() AS time');
  res.json({ status: 'ok', db_time: rows[0].time });
});

router.get('/profile', c.getProfile);
router.get('/settings', c.getSettings);
router.get('/projects', c.getProjects);
router.get('/projects/:slug', c.getProject);
router.get('/skills', c.getSkills);
router.get('/experiences', c.getExperiences);
router.get('/certificates', c.getCertificates);
router.get('/education', c.getEducation);

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: { message: 'Too many messages. Try again later.' },
});

router.post('/contact', contactLimiter, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('subject').optional({ values: 'falsy' }).trim().isLength({ max: 200 }),
  body('message').trim().isLength({ min: 10, max: 5000 })
    .withMessage('Message must be 10 to 5000 characters'),
], validate, c.createMessage);

router.use('/auth', require('./authRoutes'));

router.use('/admin', require('../middleware/auth'), require('./adminRoutes'));

module.exports = router;
