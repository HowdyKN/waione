const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

const databaseUrl =
  process.env[config.use_env_variable] ||
  config.url ||
  process.env.DATABASE_URL ||
  null;

const sequelizeOptions = {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: config.logging,
  pool: config.pool,
  dialectOptions: config.dialectOptions
};

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, sequelizeOptions)
  : new Sequelize(
      config.database,
      config.username,
      config.password,
      sequelizeOptions
    );

const db = {};

// Import models
db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.OAuthProvider = require('./OAuthProvider')(sequelize, Sequelize.DataTypes);
db.Session = require('./Session')(sequelize, Sequelize.DataTypes);

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;










