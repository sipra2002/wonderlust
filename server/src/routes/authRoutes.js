const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validators');
const { authLimiter } = require('../middlewares/rateLimiter');

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
