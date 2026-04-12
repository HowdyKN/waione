module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'Order',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      customerNumber: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          isIn: [['pending', 'confirmed', 'delivered', 'cancelled']]
        }
      },
      deliveryDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      deliveryWindow: {
        type: DataTypes.STRING(128),
        allowNull: true
      },
      totalCents: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'USD'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      addressLine1: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      addressLine2: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      city: {
        type: DataTypes.STRING(128),
        allowNull: false
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
        allowNull: false,
        defaultValue: 'US'
      },
      paymentStatus: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'unpaid',
        validate: {
          isIn: [['unpaid', 'paid', 'failed', 'refunded']]
        }
      },
      stripeCheckoutSessionId: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      stripePaymentIntentId: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      paidAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'orders',
      timestamps: true
    }
  );

  Order.associate = function (models) {
    Order.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Order.hasMany(models.OrderItem, {
      foreignKey: 'orderId',
      as: 'items'
    });
  };

  return Order;
};
