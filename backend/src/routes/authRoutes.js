const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const validate = require('../validators/validate');
const auth = require('../middleware/auth');
const c = require('../controllers/authController');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: { message: 'Too many login attempts. Try again later.' },
});

router.post('/login', loginLimiter, [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').isString().notEmpty().withMessage('Password is required'),
], validate, c.login);

router.post('/logout', c.logout);
router.get('/me', auth, c.me);

module.exports = router;
