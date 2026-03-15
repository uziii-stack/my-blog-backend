const express = require('express');
const router = express.Router();
const {
    createPost,
    getAllPosts,
    getPost,
    getPostBySlug,
    getLatestPosts,
    updatePost,
    deletePost,
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

const cors = require('cors');

// Public routes (with optional auth to detect admins)
router.get('/', cors({ origin: true }), optionalAuth, getAllPosts);
router.get('/latest', cors({ origin: true }), getLatestPosts);
router.get('/:id([0-9a-fA-F]{24})', cors({ origin: true }), optionalAuth, getPost);
router.get('/:slug', cors({ origin: true }), optionalAuth, getPostBySlug);

// Protected routes - Admin only
// WHY: CMS routes (create/edit/delete) should only be accessible to admins
// Order: protect (auth) -> adminOnly (role check) -> actual handler
// Never trust frontend role checks - backend validates everything
router.post('/', protect, adminOnly, upload.single('image'), createPost);
router.put('/:id', protect, adminOnly, upload.single('image'), updatePost);
router.delete('/:id', protect, adminOnly, deletePost);

module.exports = router;
