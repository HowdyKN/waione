'use strict';

/**
 * Family Pack list price: $5.99 (599 cents). Original seed was $99.99 (9999 cents).
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE products
      SET "priceCents" = 599, "updatedAt" = NOW()
      WHERE sku = 'FAMILY-PACK-001';
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE products
      SET "priceCents" = 9999, "updatedAt" = NOW()
      WHERE sku = 'FAMILY-PACK-001';
    `);
  }
};
