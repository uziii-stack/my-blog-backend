const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
// We use .trim() to prevent "Invalid Signature" errors caused by accidental spaces in env variables
cloudinary.config({
    cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
    api_key: (process.env.CLOUDINARY_API_KEY || '').trim(),
    api_secret: (process.env.CLOUDINARY_API_SECRET || '').trim(),
    secure: true
});

// Log configuration status (without showing the secret)
if (process.env.CLOUDINARY_CLOUD_NAME) {
    console.log(`✅ Cloudinary configured for cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
} else {
    console.error('❌ Cloudinary Error: CLOUDINARY_CLOUD_NAME is missing!');
}

module.exports = cloudinary;
