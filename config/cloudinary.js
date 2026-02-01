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

// --- DIAGNOSTIC LOGGING ---
console.log('--- Cloudinary Environment Check ---');
const foundVars = Object.keys(process.env).filter(key => key.toUpperCase().includes('CLOUDINARY'));
if (foundVars.length > 0) {
    foundVars.forEach(key => console.log(`🔍 Detected environment variable: ${key}`));
} else {
    console.error('❌ NO CLOUDINARY environment variables detected by Node.js!');
}

if (process.env.CLOUDINARY_URL) {
    console.log('✅ Cloudinary configured using CLOUDINARY_URL');
} else if (process.env.CLOUDINARY_CLOUD_NAME) {
    console.log(`✅ Cloudinary configured using individual keys for cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
}
console.log('------------------------------------');

module.exports = cloudinary;
