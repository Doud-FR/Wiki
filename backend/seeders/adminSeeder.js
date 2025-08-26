const { User } = require('../models');
const crypto = require('crypto');

const createAdminUser = async () => {
  try {
    // Check if any admin user already exists
    const existingAdmin = await User.findOne({ where: { isAdmin: true } });
    
    if (existingAdmin) {
      console.log('✓ Admin user already exists');
      return null;
    }

    // Generate a random password
    const password = crypto.randomBytes(8).toString('hex');
    
    // Create admin user
    const adminUser = await User.create({
      email: 'admin@wiki.local',
      password: password,
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,
      isActive: true
    });

    console.log('\n' + '='.repeat(60));
    console.log('🎉 ADMIN USER CREATED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('📧 Email:    admin@wiki.local');
    console.log('🔑 Password: ' + password);
    console.log('='.repeat(60));
    console.log('⚠️  IMPORTANT: Save this password as it will not be shown again!');
    console.log('='.repeat(60) + '\n');

    return { email: 'admin@wiki.local', password };
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
};

module.exports = { createAdminUser };