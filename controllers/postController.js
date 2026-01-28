const Post = require('../models/Post');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
    try {
        const { title, content, category, published } = req.body;

        // Validation
        if (!title || !content || !category) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title, content, and category',
            });
        }

        // Add image path if file was uploaded
        const image = req.file ? `/${req.file.path.replace(/\\/g, '/')}` : '';

        const post = await Post.create({
            title,
            content,
            category,
            image,
            published: published === 'true' || published === true,
            author: req.user._id,
        });

        // Populate author for response
        await post.populate('author', 'name email');

        console.log(`✅ Post created: "${title}" by ${req.user.name}`);

        res.status(201).json({
            success: true,
            data: post,
            message: 'Post created successfully',
        });
    } catch (error) {
        console.error('Error creating post:', error.message);
        next(error);
    }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getAllPosts = async (req, res, next) => {
    try {
        const { category, published } = req.query;

        // Build query
        let query = {};

        if (category) {
            query.category = category;
        }

        if (published !== undefined) {
            query.published = published === 'true';
        }

        const posts = await Post.find(query)
            .populate('author', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: posts.length,
            posts: posts, // Frontend expects 'posts' key
        });
    } catch (error) {
        console.error('Error fetching posts:', error.message);
        next(error);
    }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id).populate(
            'author',
            'name email'
        );

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }

        res.status(200).json({
            success: true,
            post: post, // Frontend expects 'post' key for single post
        });
    } catch (error) {
        console.error('Error fetching post:', error.message);
        next(error);
    }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
    try {
        let post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }

        // Check if user is the author
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this post',
            });
        }

        // Update image if new file was uploaded
        if (req.file) {
            req.body.image = `/${req.file.path.replace(/\\/g, '/')}`;
        }

        // Handle published field
        if (req.body.published !== undefined) {
            req.body.published = req.body.published === 'true' || req.body.published === true;
        }

        post = await Post.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('author', 'name email');

        console.log(`✅ Post updated: "${post.title}" by ${req.user.name}`);

        res.status(200).json({
            success: true,
            data: post,
            message: 'Post updated successfully',
        });
    } catch (error) {
        console.error('Error updating post:', error.message);
        next(error);
    }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }

        // Check if user is the author
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this post',
            });
        }

        await post.deleteOne();

        console.log(`✅ Post deleted: "${post.title}" by ${req.user.name}`);

        res.status(200).json({
            success: true,
            data: {},
            message: 'Post deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting post:', error.message);
        next(error);
    }
};
