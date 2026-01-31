'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('oauth_providers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      provider: {
        type: Sequelize.ENUM('google', 'apple', 'facebook'),
        allowNull: false
      },
      providerId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      accessToken: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      refreshToken: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: true
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

    await queryInterface.addIndex('oauth_providers', ['provider', 'providerId'], {
      unique: true,
      name: 'oauth_providers_provider_providerId_unique'
    });

    await queryInterface.addIndex('oauth_providers', ['userId'], {
      name: 'oauth_providers_userId_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('oauth_providers');
  }
};










