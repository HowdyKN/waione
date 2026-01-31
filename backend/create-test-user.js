require('dotenv').config();
const { User } = require('./src/models');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    // Test user credentials
    const testUser = {
      email: 'test@example.com',
      password: 'Test1234!',
      firstName: 'Test',
      lastName: 'User'
    };
    
    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: testUser.email }
    });
    
    if (existingUser) {
      console.log('Test user already exists!');
      console.log(`Email: ${testUser.email}`);
      console.log(`Password: ${testUser.password}`);
      console.log(`Name: ${testUser.firstName} ${testUser.lastName}`);
      process.exit(0);
    }
    
    // Create test user
    const user = await User.create({
      email: testUser.email,
      password: testUser.password, // Will be hashed by the model hook
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      isEmailVerified: true,
      isActive: true
    });
    
    console.log('✅ Test user created successfully!');
    console.log('\nLogin credentials:');
    console.log(`Email: ${testUser.email}`);
    console.log(`Password: ${testUser.password}`);
    console.log(`Name: ${testUser.firstName} ${testUser.lastName}`);
    console.log(`\nUser ID: ${user.id}`);
    
    await User.sequelize.close();
  } catch (error) {
    console.error('Error creating test user:', error.message);
    process.exit(1);
  }
})();
