'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      sku: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      priceCents: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('products', ['sku'], { unique: true, name: 'products_sku_unique' });

    await queryInterface.sequelize.query(`
      INSERT INTO products (id, sku, name, description, "priceCents", active, "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        'FAMILY-PACK-001',
        'Family Pack',
        'Fresh organic fruits & vegetables, whole grains, protein, healthy snacks — portions for 4–6 people.',
        9999,
        true,
        NOW(),
        NOW()
      )
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('products');
  }
};
