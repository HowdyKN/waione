require('dotenv').config();
const { User } = require('./src/models');

(async () => {
  try {
    const testEmail = 'test@example.com';
    const newPassword = 'Test1234!';
    
    // Find the user
    const user = await User.findOne({
      where: { email: testEmail }
    });
    
    if (!user) {
      console.log(`User with email ${testEmail} not found.`);
      console.log('Creating new test user...');
      
      const newUser = await User.create({
        email: testEmail,
        password: newPassword, // Will be hashed by the model hook
        firstName: 'Test',
        lastName: 'User',
        isEmailVerified: true,
        isActive: true
      });
      
      console.log('✅ Test user created successfully!');
      console.log(`Email: ${testEmail}`);
      console.log(`Password: ${newPassword}`);
      process.exit(0);
    }
    
    // Update the password
    console.log(`Found user: ${user.email}`);
    console.log('Resetting password...');
    
    user.password = newPassword; // Will be hashed by the beforeUpdate hook
    await user.save();
    
    console.log('✅ Password reset successfully!');
    console.log(`\nLogin credentials:`);
    console.log(`Email: ${testEmail}`);
    console.log(`Password: ${newPassword}`);
    
    // Verify the password works
    const isValid = await user.comparePassword(newPassword);
    console.log(`\nPassword verification: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    
    await User.sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
