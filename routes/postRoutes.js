const express = require('express');
const router = express.Router();
const {
    createPost,
    getAllPosts,
    getPost,
    updatePost,
    deletePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getAllPosts);
router.get('/:id', getPost);

// Protected routes
router.post('/', protect, upload.single('image'), createPost);
router.put('/:id', protect, upload.single('image'), updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;
