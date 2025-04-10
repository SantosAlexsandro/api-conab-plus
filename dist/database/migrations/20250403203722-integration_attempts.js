"use strict";'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('integration_attempts', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      ura_request_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'ura_requests', key: 'id' },
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('success', 'error'),
        allowNull: false
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('integration_attempts');
  }
};
