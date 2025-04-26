module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('work_order_waiting_queue', 'service_type');

    await queryInterface.addColumn('work_order_waiting_queue', 'ura_request_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('work_order_waiting_queue', 'ura_request_id');

    await queryInterface.addColumn('work_order_waiting_queue', 'service_type', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
