const rateLimit = require('express-rate-limit');

/**
 * ========================================
 * RATE LIMITING MIDDLEWARE
 * ========================================
 * 
 * WHY Rate Limiting?
 * - Prevents brute-force attacks on login
 * - Protects against credential stuffing
 * - Mitigates DDoS attacks
 * - Industry standard for all production APIs (Facebook, Amazon, Google all use this)
 * 
 * HOW it works:
 * - Tracks requests by IP address
 * - Rejects requests that exceed the limit
 * - Resets counters after the time window expires
 * 
 * DEPLOYMENT:
 * - Works with Railway reverse proxy (trustProxy: true)
 * - Safe for GitHub Pages frontend (IP-based, not session-based)
 */

// ===== STRICT RATE LIMITER FOR AUTHENTICATION =====
// Used on: /api/auth/login and /api/auth/register

/**
 * Strict Auth Rate Limiter
 * 
 * WHY so strict?
 * - Login is the #1 attack vector for credential stuffing
 * - 5 attempts per 15 minutes is enough for legitimate users
 * - Attackers typically try hundreds/thousands of attempts
 * 
 * Configuration:
 * - windowMs: 15 minutes (how long to remember requests)
 * - max: 5 attempts (maximum requests per window)
 * - standardHeaders: true (sends RateLimit-* headers like GitHub API)
 * - legacyHeaders: false (don't use old X-RateLimit-* headers)
 */
const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
    max: 5, // Limit each IP to 5 requests per windowMs

    // Enable if app is behind a reverse proxy (Railway, Heroku, AWS, etc.)
    // WHY: Railway/AWS use reverse proxies, need to trust X-Forwarded-For header
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers

    // Custom error message (user-friendly but doesn't leak system info)
    message: {
        success: false,
        message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
        retryAfter: '15 minutes'
    },

    // Skip successful requests (only count failures)
    // WHY: Prevents rate-limit on legitimate users who log in successfully
    skipSuccessfulRequests: false, // Count all attempts (including successful)

    // Skip failed requests
    // WHY: We want to count failed attempts, so set to false
    skipFailedRequests: false,

    // Custom handler (optional - for logging)
    handler: (req, res) => {
        console.warn(`🚨 Rate limit exceeded for IP: ${req.ip} on ${req.originalUrl}`);
        res.status(429).json({
            success: false,
            message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
            retryAfter: '15 minutes'
        });
    }
});

// ===== GENERAL API RATE LIMITER =====
// Used on: ALL /api/* routes (global protection)

/**
 * General API Rate Limiter
 * 
 * WHY more lenient than auth?
 * - Regular API usage needs higher limits (browsing posts, etc.)
 * - 100 requests per 15 minutes is reasonable for normal usage
 * - Still protects against DDoS and abuse
 * 
 * Configuration:
 * - windowMs: 15 minutes
 * - max: 100 requests
 * - Allows normal browsing while blocking abuse
 */
const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs

    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again later.',
        retryAfter: '15 minutes'
    },

    handler: (req, res) => {
        console.warn(`⚠️ API rate limit exceeded for IP: ${req.ip} on ${req.originalUrl}`);
        res.status(429).json({
            success: false,
            message: 'Too many requests from this IP. Please try again later.',
            retryAfter: '15 minutes'
        });
    }
});

// ===== EXPORTS =====
module.exports = {
    authRateLimiter,  // For /api/auth/login and /api/auth/register
    apiRateLimiter    // For all /api/* routes
};
