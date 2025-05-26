module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('push_subscriptions', 'user_name', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'user_id'
    });

    // Criar índice para melhorar performance nas consultas
    await queryInterface.addIndex('push_subscriptions', ['user_name']);
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('push_subscriptions', ['user_name']);
    await queryInterface.removeColumn('push_subscriptions', 'user_name');
  },
};
