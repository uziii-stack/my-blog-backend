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
const upload = require('../middleware/uploadMiddleware');

const cors = require('cors');

// Public routes
router.get('/', cors({ origin: true }), getAllPosts);
router.get('/latest', cors({ origin: true }), getLatestPosts);
router.get('/:id', cors({ origin: true }), getPost);

// Protected routes
router.post('/', protect, upload.single('image'), createPost);
router.put('/:id', protect, upload.single('image'), updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;
