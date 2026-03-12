/**
 * Migration script: Mark all existing posts as published
 * Run: node publish-all-posts.js
 */
const mongoose = require('mongoose');
const Post = require('./models/Post');

const MONGO_URI = 'mongodb+srv://uzairbaig040_db_user:%40FsR%24Jd7RS%40yj5P@cluster0.bgnzdhw.mongodb.net/blog-cms?retryWrites=true&w=majority&appName=Cluster0';

console.log('🔌 Connecting to MongoDB Atlas...');

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        const all = await Post.find({}, 'title published');
        console.log(`\nFound ${all.length} total posts:`);
        all.forEach(p => console.log(`  [${p.published ? 'PUBLISHED' : 'DRAFT   '}] ${p.title}`));

        const result = await Post.updateMany(
            { published: false },
            { $set: { published: true } }
        );

        console.log(`\n✅ Updated ${result.modifiedCount} post(s) → PUBLISHED`);
        console.log('Done! All your posts are now publicly visible.');
        await mongoose.disconnect();
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection Error:', err.message);
        process.exit(1);
    });
