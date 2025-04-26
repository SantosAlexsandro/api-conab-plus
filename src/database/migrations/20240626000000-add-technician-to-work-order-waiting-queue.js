module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('work_order_waiting_queue', 'technician_assigned', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('work_order_waiting_queue', 'technician_assigned');
  },
};
