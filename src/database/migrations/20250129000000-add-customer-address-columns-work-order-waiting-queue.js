module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'work_order_waiting_queue',
        'customer_street',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'work_order_waiting_queue',
        'customer_number',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'work_order_waiting_queue',
        'customer_address_complement',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'work_order_waiting_queue',
        'customer_neighborhood',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'work_order_waiting_queue',
        'customer_city',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'work_order_waiting_queue',
        'customer_state',
        {
          type: Sequelize.STRING(2),
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'work_order_waiting_queue',
        'customer_zip_code',
        {
          type: Sequelize.STRING(9),
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'work_order_waiting_queue',
        'customer_city_erp_code',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      // Adiciona índice para melhorar consultas por CEP
      await queryInterface.addIndex(
        'work_order_waiting_queue',
        ['customer_zip_code'],
        {
          name: 'idx_work_order_waiting_queue_zip_code',
          transaction
        }
      );

      // Adiciona índice para melhorar consultas por cidade
      await queryInterface.addIndex(
        'work_order_waiting_queue',
        ['customer_city', 'customer_state'],
        {
          name: 'idx_work_order_waiting_queue_city_state',
          transaction
        }
      );
    });
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Remove os índices
      await queryInterface.removeIndex(
        'work_order_waiting_queue',
        'idx_work_order_waiting_queue_zip_code',
        { transaction }
      );

      await queryInterface.removeIndex(
        'work_order_waiting_queue',
        'idx_work_order_waiting_queue_city_state',
        { transaction }
      );

      // Remove as colunas
      await queryInterface.removeColumn('work_order_waiting_queue', 'customer_street', { transaction });
      await queryInterface.removeColumn('work_order_waiting_queue', 'customer_number', { transaction });
      await queryInterface.removeColumn('work_order_waiting_queue', 'customer_address_complement', { transaction });
      await queryInterface.removeColumn('work_order_waiting_queue', 'customer_neighborhood', { transaction });
      await queryInterface.removeColumn('work_order_waiting_queue', 'customer_city', { transaction });
      await queryInterface.removeColumn('work_order_waiting_queue', 'customer_state', { transaction });
      await queryInterface.removeColumn('work_order_waiting_queue', 'customer_zip_code', { transaction });
      await queryInterface.removeColumn('work_order_waiting_queue', 'customer_city_erp_code', { transaction });
    });
  },
};
