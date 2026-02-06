const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authRateLimiter } = require('../middleware/rateLimitMiddleware');

// Public routes with strict rate limiting
// WHY: Login/register are the #1 attack vectors for credential stuffing and brute-force
// Max 5 attempts per 15 minutes prevents automated attacks while allowing legitimate users
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
