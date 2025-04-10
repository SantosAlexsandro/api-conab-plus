"use strict";'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ura_requests', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      customer_cpf: {
        type: Sequelize.STRING,
        allowNull: true
      },
      customer_cnpj: {
        type: Sequelize.STRING,
        allowNull: true
      },
      customer_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      has_active_contract: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      has_open_request: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      requester_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      requester_role: {
        type: Sequelize.STRING,
        allowNull: true
      },
      problem_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      responsible_on_site: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cancel_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'sent_to_conab', 'error_conab', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false
      },
      sent_to_conab_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ura_requests');
  }
};
