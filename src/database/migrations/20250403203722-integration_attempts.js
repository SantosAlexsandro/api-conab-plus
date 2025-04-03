'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('integration_attempts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true
      },
      ura_request_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'ura_requests', key: 'id' },
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('create_os', 'cancel_os'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'success', 'failed'),
        defaultValue: 'pending'
      },
      attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      last_attempt_at: Sequelize.DATE,
      error_message: Sequelize.TEXT,
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
    await queryInterface.dropTable('integration_attempts');
  }
};
