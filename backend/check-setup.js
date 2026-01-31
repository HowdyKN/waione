// Quick diagnostic script to check backend setup
require('dotenv').config();
const { sequelize } = require('./src/models');

async function checkSetup() {
  console.log('🔍 Checking Backend Setup...\n');

  // Check environment variables
  console.log('1. Environment Variables:');
  const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];
  let envOk = true;
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.log(`   ❌ ${varName} is missing`);
      envOk = false;
    } else {
      const displayValue = varName.includes('PASSWORD') || varName.includes('SECRET') 
        ? '***' 
        : value;
      console.log(`   ✓ ${varName} = ${displayValue}`);
    }
  });
  console.log('');

  // Check database connection
  console.log('2. Database Connection:');
  try {
    await sequelize.authenticate();
    console.log('   ✓ Database connection successful\n');
  } catch (error) {
    console.log(`   ❌ Database connection failed: ${error.message}\n`);
    console.log('   💡 Make sure:');
    console.log('      - Docker container is running: docker compose ps');
    console.log('      - Database credentials in .env are correct');
    console.log('      - Database "waione_db" exists\n');
    process.exit(1);
  }

  // Check if tables exist
  console.log('3. Database Tables:');
  try {
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const expectedTables = ['users', 'sessions', 'oauth_providers'];
    const existingTables = tables.map(t => t.table_name);
    
    expectedTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`   ✓ Table '${table}' exists`);
      } else {
        console.log(`   ❌ Table '${table}' is missing`);
      }
    });
    
    if (existingTables.length === 0) {
      console.log('\n   ⚠️  No tables found! Run migrations:');
      console.log('      cd backend && npm run migrate\n');
    } else {
      console.log('');
    }
  } catch (error) {
    console.log(`   ❌ Error checking tables: ${error.message}\n`);
  }

  // Check JWT configuration
  console.log('4. JWT Configuration:');
  try {
    const authConfig = require('./src/config/auth');
    if (authConfig.jwt.secret && authConfig.jwt.secret !== 'your-super-secret-jwt-key-change-in-production') {
      console.log('   ✓ JWT secret is configured');
    } else {
      console.log('   ⚠️  JWT secret is using default value (not secure for production)');
    }
    console.log('');
  } catch (error) {
    console.log(`   ❌ Error loading auth config: ${error.message}\n`);
  }

  console.log('✅ Setup check complete!\n');
  await sequelize.close();
}

checkSetup().catch(error => {
  console.error('❌ Setup check failed:', error);
  process.exit(1);
});

