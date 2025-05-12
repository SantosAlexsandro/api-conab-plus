"use strict";module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Para MySQL, precisamos alterar a coluna com o novo ENUM
    await queryInterface.changeColumn('work_order_waiting_queue', 'status', {
      type: Sequelize.ENUM(
        'RECEIVED',
        'WAITING_CREATION',
        'WAITING_TECHNICIAN',
        'WAITING_ARRIVAL',
        'IN_PROGRESS',
        'FINISHED',
        'FAILED',
        'CANCELED',
        'FULFILLED'
      ),
      defaultValue: 'RECEIVED',
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Retorna para o estado anterior
    await queryInterface.changeColumn('work_order_waiting_queue', 'status', {
      type: Sequelize.ENUM(
        'RECEIVED',
        'WAITING_CREATION',
        'WAITING_TECHNICIAN',
        'WAITING_ARRIVAL',
        'IN_PROGRESS',
        'FINISHED',
        'FAILED'
      ),
      defaultValue: 'RECEIVED',
      allowNull: false,
    });
  },
};
