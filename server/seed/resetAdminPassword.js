/**
 * Reset admin password to a known value.
 *
 * Usage:
 *   cd server
 *   node seed/resetAdminPassword.js
 *
 * New credentials after running:
 *   Email:    admin@marketly.com
 *   Password: admin123456
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

const ADMIN_EMAIL = 'admin@marketly.com';
const NEW_PASSWORD = 'admin123456';

async function resetPassword() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!\n');

    const user = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (!user) {
      console.log(`❌ No user found with email: ${ADMIN_EMAIL}`);
      console.log(`   Run "node seed/seedAdmin.js" first to create the admin.`);
    } else {
      // Set new password — the pre('save') hook will hash it
      user.passwordHash = NEW_PASSWORD;
      await user.save();
      console.log(`✅ Admin password reset successfully!`);
      console.log(`   Email:    ${ADMIN_EMAIL}`);
      console.log(`   Password: ${NEW_PASSWORD}`);
      console.log(`   Role:     ${user.role}`);
      console.log(`\n🔑 Login at: http://localhost:8080/admin/login`);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
    process.exit(0);
  }
}

resetPassword();
