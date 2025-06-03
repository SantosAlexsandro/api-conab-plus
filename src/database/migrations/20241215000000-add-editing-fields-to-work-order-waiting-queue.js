module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('work_order_waiting_queue', 'is_editing', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('work_order_waiting_queue', 'edited_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('work_order_waiting_queue', 'is_editing');
    await queryInterface.removeColumn('work_order_waiting_queue', 'edited_at');
  }
};
