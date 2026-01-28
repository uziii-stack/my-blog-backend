/**
 * Script to create an admin user
 * Run with: npm run create-admin
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Check if .env file is configured
if (!process.env.MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI is not defined in .env file');
    console.log('💡 Please create a .env file and add your MongoDB connection string');
    process.exit(1);
}

const createAdmin = async () => {
    try {
        console.log('🔄 Connecting to database...');

        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Database connected successfully');

        // Check if admin already exists
        const adminEmail = 'admin@blog.com';
        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log('⚠️  Admin user already exists!');
            console.log(`📧 Email: ${adminExists.email}`);
            console.log(`👤 Name: ${adminExists.name}`);
            console.log('\n💡 To create a new admin, delete the existing one first or use a different email');
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            name: 'Admin',
            email: adminEmail,
            password: 'admin123',
            role: 'admin'
        });

        console.log('\n✅ Admin user created successfully!');
        console.log('===========================================');
        console.log(`📧 Email: ${admin.email}`);
        console.log(`🔑 Password: admin123`);
        console.log(`👤 Name: ${admin.name}`);
        console.log(`🎭 Role: ${admin.role}`);
        console.log('===========================================');
        console.log('\n⚠️  IMPORTANT SECURITY NOTICE:');
        console.log('   1. Login and change this password immediately!');
        console.log('   2. Do not use this default password in production!');
        console.log('   3. Use a strong, unique password for your admin account\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);

        if (error.name === 'ValidationError') {
            console.log('\n💡 Validation errors:');
            Object.values(error.errors).forEach(err => {
                console.log(`   - ${err.message}`);
            });
        } else if (error.name === 'MongoServerError' && error.code === 11000) {
            console.log('\n💡 An admin with this email already exists');
        } else {
            console.log('\n💡 Troubleshooting:');
            console.log('   1. Check your MONGODB_URI in .env file');
            console.log('   2. Ensure MongoDB is running');
            console.log('   3. Check network connectivity');
        }

        process.exit(1);
    }
};

// Run the function
createAdmin();
