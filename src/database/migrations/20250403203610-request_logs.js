'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('request_logs', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      ura_request_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      source: {
        type: Sequelize.STRING,
        allowNull: false
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false
      },
      payload_snapshot: {
        type: Sequelize.JSON,
        allowNull: true
      },
      status_code: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      error: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('request_logs');
  }
};
