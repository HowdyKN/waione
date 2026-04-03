module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define(
    'OrderItem',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      orderId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: 1 }
      },
      unitPriceCents: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      tableName: 'order_items',
      timestamps: true
    }
  );

  OrderItem.associate = function (models) {
    OrderItem.belongsTo(models.Order, {
      foreignKey: 'orderId',
      as: 'order'
    });
    OrderItem.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });
  };

  return OrderItem;
};
