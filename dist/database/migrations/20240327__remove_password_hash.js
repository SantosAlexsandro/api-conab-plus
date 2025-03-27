"use strict";module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn('user_sessions', 'password_hash');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_sessions', 'password_hash', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
};
