/**
 * ========================================
 * ADMIN-ONLY MIDDLEWARE
 * ========================================
 * 
 * WHY?
 * - Never trust frontend role/flags (JavaScript can be modified)
 * - Backend must validate user role independently
 * - Industry standard: Backend validates EVERYTHING
 * 
 * HOW it works:
 * - Assumes user is already authenticated (protect middleware ran first)
 * - Checks user role from database (not from token payload)
 * - Rejects non-admin users with 403 Forbidden
 * 
 * USAGE:
 * - Apply to CMS routes (create/edit/delete posts)
 * - Must be used AFTER protect middleware
 * - Example: router.post('/posts', protect, adminOnly, createPost)
 */

/**
 * Admin-Only Middleware
 * 
 * Ensures only admin users can access protected CMS routes
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * Prerequisites:
 * - User must already be authenticated (protect middleware)
 * - req.user must be populated by protect middleware
 */
exports.adminOnly = async (req, res, next) => {
    try {
        // Check if user exists (should be populated by protect middleware)
        if (!req.user) {
            console.warn('⚠️ adminOnly: req.user not found (protect middleware may not have run)');
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        // Check if user has admin role
        // WHY: Never trust frontend - always validate role from database
        if (req.user.role !== 'admin') {
            console.warn(`🚫 Access denied: User ${req.user.email} (role: ${req.user.role}) attempted to access admin route ${req.originalUrl}`);
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        // User is admin - allow access
        console.log(`✅ Admin access granted: ${req.user.email} accessing ${req.originalUrl}`);
        next();

    } catch (error) {
        console.error('❌ Admin middleware error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error during authorization check'
        });
    }
};
