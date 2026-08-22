/**
 * Script to create Ghufran user with editor role
 * Run with: node create-ghufran.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

if (!process.env.MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI is not defined in .env file');
    process.exit(1);
}

const fs = require('fs');

const createGhufran = async () => {
    const log = [];
    try {
        log.push('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        log.push('Database connected successfully');

        const ghufranEmail = 'me.ghufrannaseer@gmail.com';
        let user = await User.findOne({ email: ghufranEmail });

        if (user) {
            log.push(`User already exists: ${user.email}, Role: ${user.role}`);
            
            // Ensure role is editor
            if (user.role !== 'editor') {
                user.role = 'editor';
                await user.save();
                log.push('Role updated to editor');
            }
            fs.writeFileSync('./create-ghufran.log', JSON.stringify({ success: true, user, log }, null, 2));
            process.exit(0);
        }

        // Create new editor user
        user = await User.create({
            name: 'Ghufran Naseer',
            email: ghufranEmail,
            password: '123456',
            role: 'editor'
        });

        log.push(`Ghufran user created successfully: ${user.email}, ${user.name}, role: ${user.role}`);
        fs.writeFileSync('./create-ghufran.log', JSON.stringify({ success: true, user: { _id: user._id, name: user.name, email: user.email, role: user.role }, log }, null, 2));
        process.exit(0);
    } catch (error) {
        log.push(`Error: ${error.message}`);
        fs.writeFileSync('./create-ghufran.log', JSON.stringify({ success: false, error: error.message, log }, null, 2));
        process.exit(1);
    }
};

createGhufran();

