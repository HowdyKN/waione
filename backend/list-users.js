require('dotenv').config();
const { sequelize } = require('./src/models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database\n');
    
    const [users] = await sequelize.query(`
      SELECT 
        email, 
        "firstName", 
        "lastName", 
        "isActive",
        "createdAt"
      FROM users 
      ORDER BY "createdAt" 
      LIMIT 20
    `);
    
    if (users.length === 0) {
      console.log('No users found in the database.');
      console.log('\nYou can create a test user by registering through the app or by running:');
      console.log('node create-test-user.js');
    } else {
      console.log(`Found ${users.length} user(s) in the database:\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Active: ${user.isActive}`);
        console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
        console.log('');
      });
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
