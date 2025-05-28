module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adiciona o novo status URA_FAILURE
    await queryInterface.sequelize.query(
      `ALTER TYPE enum_work_order_waiting_queue_status ADD VALUE IF NOT EXISTS 'URA_FAILURE' AFTER 'FAILED'`
    );

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
    });
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('work_order_waiting_queue', 'customer_identifier', { transaction });
      await queryInterface.removeColumn('work_order_waiting_queue', 'product_id', { transaction });
      await queryInterface.removeColumn('work_order_waiting_queue', 'requester_name_and_position', { transaction });
      await queryInterface.removeColumn('work_order_waiting_queue', 'incident_and_receiver_name', { transaction });
      await queryInterface.removeColumn('work_order_waiting_queue', 'requester_contact', { transaction });
      await queryInterface.removeColumn('work_order_waiting_queue', 'cancellation_requester_info', { transaction });
      await queryInterface.removeColumn('work_order_waiting_queue', 'failure_reason', { transaction });

      // Remover o status URA_FAILURE não é possível diretamente em PostgreSQL
      // Será necessário recriar o ENUM sem esse valor se necessário
    });
  },
}; 