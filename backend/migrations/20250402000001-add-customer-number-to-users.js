'use strict';

const MIN = 1_000_000_000;
const MAX = 9_999_999_999;

function randomTenDigitString() {
  return String(Math.floor(MIN + Math.random() * (MAX - MIN + 1)));
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'customerNumber', {
      type: Sequelize.STRING(10),
      allowNull: true,
      unique: true
    });

    const [rows] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE "customerNumber" IS NULL`
    );

    for (const row of rows) {
      let candidate = randomTenDigitString();
      for (let attempt = 0; attempt < 100; attempt++) {
        const [conflict] = await queryInterface.sequelize.query(
          `SELECT id FROM users WHERE "customerNumber" = :candidate`,
          { replacements: { candidate } }
        );
        if (!conflict.length) break;
        candidate = randomTenDigitString();
      }
      await queryInterface.sequelize.query(
        `UPDATE users SET "customerNumber" = :candidate WHERE id = :id`,
        { replacements: { candidate, id: row.id } }
      );
    }

    await queryInterface.changeColumn('users', 'customerNumber', {
      type: Sequelize.STRING(10),
      allowNull: false,
      unique: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'customerNumber');
  }
};
