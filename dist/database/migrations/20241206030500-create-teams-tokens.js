"use strict";'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('teams_tokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'ID único do usuário Teams (ex: work_order_bot)'
      },
      access_token: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Access token para API do Microsoft Graph'
      },
      refresh_token: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Refresh token para renovação automática'
      },
      token_type: {
        type: Sequelize.STRING(50),
        defaultValue: 'Bearer',
        comment: 'Tipo do token (normalmente Bearer)'
      },
      scope: {
        type: Sequelize.TEXT,
        comment: 'Escopos autorizados para o token'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Data/hora de expiração do access token'
      },
      expires_in: {
        type: Sequelize.INTEGER,
        comment: 'Tempo de vida do token em segundos'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Se o token está ativo e válido'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        type: Sequelize.DATE,
        comment: 'Data de exclusão (soft delete)'
      }
    });

    // Criar índices
    await queryInterface.addIndex('teams_tokens', ['user_id'], {
      unique: true,
      name: 'teams_tokens_user_id_unique'
    });

    await queryInterface.addIndex('teams_tokens', ['expires_at'], {
      name: 'teams_tokens_expires_at_idx'
    });

    await queryInterface.addIndex('teams_tokens', ['is_active'], {
      name: 'teams_tokens_is_active_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('teams_tokens');
  }
};
