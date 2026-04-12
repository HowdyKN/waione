'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'paymentStatus', {
      type: Sequelize.STRING(32),
      allowNull: true
    });
    await queryInterface.addColumn('orders', 'stripeCheckoutSessionId', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    await queryInterface.addColumn('orders', 'stripePaymentIntentId', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    await queryInterface.addColumn('orders', 'paidAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.sequelize.query(`
      UPDATE orders
      SET "paymentStatus" = 'paid',
          "paidAt" = COALESCE("updatedAt", "createdAt")
      WHERE "paymentStatus" IS NULL;
    `);

    await queryInterface.changeColumn('orders', 'paymentStatus', {
      type: Sequelize.STRING(32),
      allowNull: false,
      defaultValue: 'unpaid'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('orders', 'paidAt');
    await queryInterface.removeColumn('orders', 'stripePaymentIntentId');
    await queryInterface.removeColumn('orders', 'stripeCheckoutSessionId');
    await queryInterface.removeColumn('orders', 'paymentStatus');
  }
};
