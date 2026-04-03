const bcrypt = require('bcryptjs');
const { generateUniqueCustomerNumber } = require('../utils/customerNumber');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for OAuth-only users
      validate: {
        len: [8, 100] // Only validate if password exists
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    addressLine1: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    addressLine2: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    state: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    postalCode: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(64),
      allowNull: true,
      defaultValue: 'US'
    },
    customerNumber: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      validate: {
        len: [10, 10],
        isNumeric: true
      }
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    paranoid: true, // Enable soft deletes
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['customerNumber']
      }
    ],
    hooks: {
      beforeValidate: async (user) => {
        if (user.isNewRecord && !user.customerNumber) {
          user.customerNumber = await generateUniqueCustomerNumber(user.constructor);
        }
      },
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  // Instance methods
  User.prototype.comparePassword = async function(candidatePassword) {
    if (!this.password) {
      return false;
    }
    return await bcrypt.compare(candidatePassword, this.password);
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  // Associations
  User.associate = function(models) {
    User.hasMany(models.OAuthProvider, {
      foreignKey: 'userId',
      as: 'oauthProviders'
    });
    User.hasMany(models.Session, {
      foreignKey: 'userId',
      as: 'sessions'
    });
    User.hasMany(models.Order, {
      foreignKey: 'userId',
      as: 'orders'
    });
  };

  return User;
};










