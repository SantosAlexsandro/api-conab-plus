"use strict";module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('request_logs', 'response_snapshot', {
      type: Sequelize.JSON,
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('request_logs', 'response_snapshot');
  }
};
