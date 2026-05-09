/**
 * Seed script to create an admin user in the database.
 *
 * Usage:
 *   cd server
 *   node seed/seedAdmin.js
 *
 * Default credentials:
 *   Email:    admin@marketly.com
 *   Password: admin123456
 *
 * Change credentials below before running in production.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

const ADMIN_NAME = 'Admin';
const ADMIN_EMAIL = 'admin@marketly.com';
const ADMIN_PASSWORD = 'admin123456';

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!\n');

    // Check if admin already exists
    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existing) {
      if (existing.role === 'admin') {
        console.log(`✅ Admin user already exists:`);
        console.log(`   Email:    ${ADMIN_EMAIL}`);
        console.log(`   Role:     ${existing.role}`);
        console.log(`   ID:       ${existing._id}`);
        console.log(`\n   Password is unchanged — use the password you set previously.`);
        console.log(`   If you forgot it, delete the user from MongoDB Atlas and run this script again.`);
      } else {
        // User exists but not admin — upgrade role
        existing.role = 'admin';
        await existing.save();
        console.log(`✅ Existing user upgraded to admin:`);
        console.log(`   Email:    ${ADMIN_EMAIL}`);
        console.log(`   Role:     admin`);
        console.log(`   Password: (unchanged — whatever was set at registration)`);
      }
    } else {
      // Create new admin user
      const admin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL.toLowerCase(),
        passwordHash: ADMIN_PASSWORD, // Will be auto-hashed by the pre('save') hook
        role: 'admin',
      });
      console.log(`✅ Admin user created successfully!`);
      console.log(`   Email:    ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
      console.log(`   Role:     admin`);
      console.log(`   ID:       ${admin._id}`);
    }

    console.log(`\n🔑 Login at: http://localhost:8080/admin/login`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
    process.exit(0);
  }
}

seedAdmin();
