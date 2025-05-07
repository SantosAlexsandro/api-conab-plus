"use strict";module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('push_subscriptions', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      endpoint: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      expiration_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      p256dh: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      auth: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('push_subscriptions');
  },
};
