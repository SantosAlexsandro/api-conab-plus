"use strict";module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('work_order_waiting_queue', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      order_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      entity_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      service_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      priority: {
        type: Sequelize.ENUM('low', 'normal', 'high'),
        defaultValue: 'normal',
        allowNull: false,
      },
      status: {
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
      },
      source: {
        type: Sequelize.STRING,
        defaultValue: 'g4flex',
        allowNull: false,
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
    await queryInterface.dropTable('work_order_waiting_queue');
  },
};
