const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide a title'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        content: {
            type: String,
            required: [true, 'Please provide content'],
        },
        category: {
            type: String,
            required: [true, 'Please provide a category'],
        },
        image: {
            type: String,
            default: '',
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        slug: {
            type: String,
            unique: true,
        },
        published: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Generate slug from title before saving
postSchema.pre('save', function (next) {
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    }
    next();
});

module.exports = mongoose.model('Post', postSchema);
