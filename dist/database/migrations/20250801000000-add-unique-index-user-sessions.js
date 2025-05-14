"use strict";module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('user_sessions', ['user_name'], {
      unique: true,
      name: 'user_sessions_user_name_unique'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('user_sessions', 'user_sessions_user_name_unique');
  },
};
