const Post = require('../models/Post');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

/**
 * Helper to upload image from memory buffer to Cloudinary
 */
const uploadFromBuffer = (file) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'blog_posts' },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        stream.end(file.buffer);
    });
};

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

        // Upload image to Cloudinary if file was uploaded
        let image = '';
        let cloudinaryId = '';

        if (req.file) {
            try {
                const result = await uploadFromBuffer(req.file);
                image = result.secure_url;
                cloudinaryId = result.public_id;
            } catch (error) {
                console.error('❌ Cloudinary Upload Error Details:', error);
                return res.status(500).json({
                    success: false,
                    message: `Cloudinary Upload Error: ${error.message || 'Unknown error'}`,
                });
            }
        }

        const post = await Post.create({
            title,
            content,
            category,
            image,
            cloudinaryId,
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
        const { category, published, limit } = req.query;

        // Build query
        let query = {};

        if (category) {
            query.category = category;
        }

        // Revert: Only filter by published if explicitly requested
        if (published === 'true') {
            query.published = true;
        } else if (published === 'false') {
            query.published = false;
        }

        // Apply limit if provided
        const finalLimit = limit ? parseInt(limit) : 0;

        const posts = await Post.find(query)
            .populate('author', 'name email')
            .sort({ createdAt: -1 })
            .limit(finalLimit);

        // Maintain response format for both legacy and new consumers
        const formattedPosts = posts.map(post => ({
            id: post._id,
            _id: post._id,
            title: post.title,
            slug: post.slug,
            excerpt: post.content.substring(0, 150).replace(/(\r\n|\n|\r)/gm, " ") + '...',
            content: post.content,
            category: post.category,
            tags: post.category ? [post.category] : [],
            coverImage: post.image,
            image: post.image,
            published: post.published,
            publishedAt: post.createdAt,
            createdAt: post.createdAt,
            author: post.author
        }));

        res.status(200).json({
            success: true,
            count: formattedPosts.length,
            posts: formattedPosts,
        });
    } catch (error) {
        console.error('Error fetching posts:', error.message);
        next(error);
    }
};

// @desc    Get latest 3 published posts
// @route   GET /api/posts/latest
// @access  Public
exports.getLatestPosts = async (req, res, next) => {
    try {
        const posts = await Post.find({ published: true })
            .sort({ createdAt: -1 })
            .limit(3)
            .select('_id title content image createdAt slug');

        // Transform for a clean "data" contract as requested
        const formattedPosts = posts.map(post => ({
            _id: post._id,
            title: post.title,
            excerpt: post.content.substring(0, 150).replace(/(\r\n|\n|\r)/gm, " ") + '...',
            image: post.image,
            createdAt: post.createdAt,
            slug: post.slug
        }));

        res.status(200).json({
            success: true,
            data: formattedPosts
        });
    } catch (error) {
        console.error('Error fetching latest posts:', error.message);
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
            try {
                // Delete old image from Cloudinary if it exists
                if (post.cloudinaryId) {
                    try {
                        await cloudinary.uploader.destroy(post.cloudinaryId);
                    } catch (destroyErr) {
                        console.warn('⚠️ Could not delete old image from Cloudinary:', destroyErr.message);
                    }
                }

                const result = await uploadFromBuffer(req.file);
                req.body.image = result.secure_url;
                req.body.cloudinaryId = result.public_id;
            } catch (error) {
                console.error('❌ Cloudinary Update Error Details:', error);
                return res.status(500).json({
                    success: false,
                    message: `Cloudinary Update Error: ${error.message || 'Unknown error'}`,
                });
            }
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

        // Delete image from Cloudinary if it exists
        if (post.cloudinaryId) {
            try {
                await cloudinary.uploader.destroy(post.cloudinaryId);
            } catch (error) {
                console.error('Cloudinary deletion error:', error.message);
                // Continue with post deletion anyway
            }
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
