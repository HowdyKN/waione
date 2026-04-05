'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('phone_otp_challenges', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      phoneE164: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        field: 'phone_e164'
      },
      codeHash: {
        type: Sequelize.STRING(128),
        allowNull: false,
        field: 'code_hash'
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'expires_at'
      },
      attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'created_at'
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'updated_at'
      }
    });

    await queryInterface.addIndex('phone_otp_challenges', ['expires_at'], {
      name: 'phone_otp_challenges_expires_at'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('phone_otp_challenges');
  }
};
