"use strict";'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('request_logs', 'ura_request_id', {
      type: Sequelize.UUID,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('request_logs', 'ura_request_id', {
      type: Sequelize.UUID,
      allowNull: false
    });
  }
};
