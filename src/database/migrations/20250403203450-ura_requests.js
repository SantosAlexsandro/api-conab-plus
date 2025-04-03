'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ura_requests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true
      },
      requester_id: Sequelize.STRING,
      requester_whatsapp: Sequelize.STRING,
      equipment_code: Sequelize.STRING,
      has_active_contract: Sequelize.BOOLEAN,
      has_open_request: Sequelize.BOOLEAN,
      requester_name: Sequelize.STRING,
      requester_role: Sequelize.STRING,
      problem_description: Sequelize.TEXT,
      responsible_on_site: Sequelize.STRING,
      cancel_reason: Sequelize.TEXT,
      status: {
        type: Sequelize.ENUM('pending', 'sent_to_conab', 'error_conab', 'cancelled'),
        defaultValue: 'pending'
      },
      sent_to_conab_at: Sequelize.DATE,
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ura_requests');
  }
};
