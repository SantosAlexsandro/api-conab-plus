'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('request_logs', {
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
      source: Sequelize.STRING,
      action: Sequelize.STRING,
      payload_snapshot: Sequelize.JSON,
      status_code: Sequelize.INTEGER,
      error: Sequelize.TEXT,
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('request_logs');
  }
};
