"use strict";module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Para MariaDB, precisamos usar ALTER TABLE MODIFY COLUMN para alterar o ENUM
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
        'FULFILLED',
        'URA_FAILURE'
      ),
      allowNull: false,
      defaultValue: 'RECEIVED'
    });

    // Adiciona as novas colunas
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'work_order_waiting_queue',
        'customer_identifier',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'work_order_waiting_queue',
        'product_id',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'work_order_waiting_queue',
        'requester_name_and_position',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'work_order_waiting_queue',
        'incident_and_receiver_name',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'work_order_waiting_queue',
        'requester_contact',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'work_order_waiting_queue',
        'cancellation_requester_info',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'work_order_waiting_queue',
        'failure_reason',
        {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        { transaction }
      );

      // Adiciona índice para customer_identifier
      await queryInterface.addIndex(
        'work_order_waiting_queue',
        ['customer_identifier'],
        {
          name: 'idx_work_order_waiting_queue_customer',
          transaction
        }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Remove o índice
      await queryInterface.removeIndex(
        'work_order_waiting_queue',
        'idx_work_order_waiting_queue_customer',
        { transaction }
      );

      // Remove as colunas
      await queryInterface.removeColumn('work_order_waiting_queue', 'customer_identifier', { transaction });
      await queryInterface.removeColumn('work_order_waiting_queue', 'product_id', { transaction });
      await queryInterface.removeColumn('work_order_waiting_queue', 'requester_name_and_position', { transaction });
      await queryInterface.removeColumn('work_order_waiting_queue', 'incident_and_receiver_name', { transaction });
      await queryInterface.removeColumn('work_order_waiting_queue', 'requester_contact', { transaction });
      await queryInterface.removeColumn('work_order_waiting_queue', 'cancellation_requester_info', { transaction });
      await queryInterface.removeColumn('work_order_waiting_queue', 'failure_reason', { transaction });

      // Reverte o ENUM para o estado anterior (sem URA_FAILURE)
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
        allowNull: false,
        defaultValue: 'RECEIVED'
      });
    });
  },
};