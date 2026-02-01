const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
// Prioritize CLOUDINARY_URL if present, otherwise use individual keys
if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
        cloudinary_url: process.env.CLOUDINARY_URL.trim(),
        secure: true
    });
} else {
    cloudinary.config({
        cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
        api_key: (process.env.CLOUDINARY_API_KEY || '').trim(),
        api_secret: (process.env.CLOUDINARY_API_SECRET || '').trim(),
        secure: true
    });
}

// Log configuration status (without showing the secret)
if (process.env.CLOUDINARY_URL) {
    console.log('✅ Cloudinary configured using CLOUDINARY_URL');
} else if (process.env.CLOUDINARY_CLOUD_NAME) {
    console.log(`✅ Cloudinary configured using individual keys for cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
} else {
    console.error('❌ Cloudinary Error: No configuration found!');
}

module.exports = cloudinary;
