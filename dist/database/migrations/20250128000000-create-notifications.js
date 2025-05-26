"use strict";'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_name: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Nome do usuário destinatário (null = para todos)'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Título da notificação'
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Corpo da mensagem'
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Tipo da notificação (work_order_created, technician_assigned, etc.)'
      },
      priority: {
        type: Sequelize.ENUM('low', 'normal', 'high', 'urgent'),
        defaultValue: 'normal',
        comment: 'Prioridade da notificação'
      },
      status: {
        type: Sequelize.ENUM('pending', 'sent', 'failed', 'read'),
        defaultValue: 'pending',
        comment: 'Status da notificação'
      },
      channels: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Canais de entrega (push, email, whatsapp, etc.)'
      },
      data: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Dados adicionais da notificação (workOrderNumber, customerName, etc.)'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadados técnicos (IP, user agent, etc.)'
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data/hora de envio'
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data/hora de leitura'
      },
      failed_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Motivo da falha (se status = failed)'
      },
      source: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Origem da notificação (g4flex, erp, manual, etc.)'
      },
      reference_id: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'ID de referência (número da OS, ID do cliente, etc.)'
      },
      reference_type: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Tipo de referência (work_order, customer, etc.)'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data de expiração da notificação'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Índices para performance
    await queryInterface.addIndex('notifications', ['user_name']);
    await queryInterface.addIndex('notifications', ['status']);
    await queryInterface.addIndex('notifications', ['type']);
    await queryInterface.addIndex('notifications', ['created_at']);
    await queryInterface.addIndex('notifications', ['reference_id', 'reference_type']);
    await queryInterface.addIndex('notifications', ['user_name', 'status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notifications');
  }
};
