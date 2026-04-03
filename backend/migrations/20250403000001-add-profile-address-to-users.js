'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'addressLine1', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    await queryInterface.addColumn('users', 'addressLine2', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    await queryInterface.addColumn('users', 'city', {
      type: Sequelize.STRING(128),
      allowNull: true
    });
    await queryInterface.addColumn('users', 'state', {
      type: Sequelize.STRING(64),
      allowNull: true
    });
    await queryInterface.addColumn('users', 'postalCode', {
      type: Sequelize.STRING(32),
      allowNull: true
    });
    await queryInterface.addColumn('users', 'country', {
      type: Sequelize.STRING(64),
      allowNull: true,
      defaultValue: 'US'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'addressLine1');
    await queryInterface.removeColumn('users', 'addressLine2');
    await queryInterface.removeColumn('users', 'city');
    await queryInterface.removeColumn('users', 'state');
    await queryInterface.removeColumn('users', 'postalCode');
    await queryInterface.removeColumn('users', 'country');
  }
};
