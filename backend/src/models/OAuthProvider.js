module.exports = (sequelize, DataTypes) => {
  const OAuthProvider = sequelize.define('OAuthProvider', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    provider: {
      type: DataTypes.ENUM('google', 'apple', 'facebook'),
      allowNull: false
    },
    providerId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'oauth_providers',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['provider', 'providerId']
      },
      {
        fields: ['userId']
      }
    ]
  });

  // Associations
  OAuthProvider.associate = function(models) {
    OAuthProvider.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return OAuthProvider;
};










