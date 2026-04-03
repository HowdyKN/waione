module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    'Product',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      sku: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      priceCents: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      tableName: 'products',
      timestamps: true
    }
  );

  Product.associate = function (models) {
    Product.hasMany(models.OrderItem, {
      foreignKey: 'productId',
      as: 'orderItems'
    });
  };

  return Product;
};
