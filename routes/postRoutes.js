const express = require('express');
const router = express.Router();
const {
    createPost,
    getAllPosts,
    getPost,
    getLatestPosts,
    updatePost,
    deletePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

const cors = require('cors');

// Public routes
router.get('/', cors({ origin: true }), getAllPosts);
router.get('/latest', cors({ origin: true }), getLatestPosts);
router.get('/:id', cors({ origin: true }), getPost);

// Protected routes - Admin only
// WHY: CMS routes (create/edit/delete) should only be accessible to admins
// Order: protect (auth) -> adminOnly (role check) -> actual handler
// Never trust frontend role checks - backend validates everything
router.post('/', protect, adminOnly, upload.single('image'), createPost);
router.put('/:id', protect, adminOnly, upload.single('image'), updatePost);
router.delete('/:id', protect, adminOnly, deletePost);

module.exports = router;
