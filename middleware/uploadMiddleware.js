const multer = require('multer');
const path = require('path');

// Configure storage to use memory (instead of disk) for Cloudinary/Railway compatibility
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};

// Get max file size from env or default to 5MB
const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE || 5 * 1024 * 1024;

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: MAX_FILE_SIZE, // Configurable file size limit
    },
    fileFilter: fileFilter,
});

module.exports = upload;
