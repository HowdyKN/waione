module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
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
    token: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    deviceInfo: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'sessions',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['token']
      },
      {
        fields: ['expiresAt']
      }
    ]
  });

  // Associations
  Session.associate = function(models) {
    Session.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Session;
};










