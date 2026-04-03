'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      customerNumber: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(32),
        allowNull: false,
        defaultValue: 'pending'
      },
      deliveryDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      deliveryWindow: {
        type: Sequelize.STRING(128),
        allowNull: true
      },
      totalCents: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'USD'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      addressLine1: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      addressLine2: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(128),
        allowNull: false
      },
      state: {
        type: Sequelize.STRING(64),
        allowNull: true
      },
      postalCode: {
        type: Sequelize.STRING(32),
        allowNull: true
      },
      country: {
        type: Sequelize.STRING(64),
        allowNull: false,
        defaultValue: 'US'
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

    await queryInterface.addIndex('orders', ['userId', 'createdAt'], {
      name: 'orders_userId_createdAt'
    });
    await queryInterface.addIndex('orders', ['customerNumber'], {
      name: 'orders_customerNumber'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('orders');
  }
};
