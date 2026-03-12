require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./models/Post');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const all = await Post.find({}, 'title published');
        console.log('=== ALL POSTS ===');
        all.forEach(p => console.log(`[${p.published ? 'PUBLISHED' : 'DRAFT   '}] ${p.title}`));
        console.log(`\nTotal: ${all.length} | Published: ${all.filter(p => p.published).length} | Drafts: ${all.filter(p => !p.published).length}`);
        mongoose.disconnect();
    })
    .catch(err => {
        console.error('Connection error:', err.message);
        process.exit(1);
    });
