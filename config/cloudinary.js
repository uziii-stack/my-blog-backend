const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
// Support either individual keys or the full CLOUDINARY_URL for better reliability
if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
        cloudinary_url: process.env.CLOUDINARY_URL,
        secure: true
    });
} else {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    });
}

module.exports = cloudinary;
