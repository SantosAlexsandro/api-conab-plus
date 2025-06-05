"use strict";module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'work_order_waiting_queue',
      'caller_phone_number',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('work_order_waiting_queue', 'caller_phone_number');
  },
};
