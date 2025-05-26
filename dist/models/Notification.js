"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _sequelize = require('sequelize');

 class Notification extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: _sequelize.DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_name: {
          type: _sequelize.DataTypes.STRING,
          allowNull: true,
          comment: 'Nome do usuário destinatário (null = para todos)',
        },
        title: {
          type: _sequelize.DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
            len: [1, 255],
          },
        },
        body: {
          type: _sequelize.DataTypes.TEXT,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        type: {
          type: _sequelize.DataTypes.STRING,
          allowNull: false,
          validate: {
            isIn: [['work_order_created', 'technician_assigned', 'work_order_completed', 'system_alert', 'maintenance', 'custom']],
          },
        },
        priority: {
          type: _sequelize.DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
          defaultValue: 'normal',
        },
        status: {
          type: _sequelize.DataTypes.ENUM('pending', 'sent', 'failed', 'read'),
          defaultValue: 'pending',
        },
        channels: {
          type: _sequelize.DataTypes.JSON,
          allowNull: true,
          defaultValue: ['push'],
        },
        data: {
          type: _sequelize.DataTypes.JSON,
          allowNull: true,
        },
        metadata: {
          type: _sequelize.DataTypes.JSON,
          allowNull: true,
        },
        sent_at: {
          type: _sequelize.DataTypes.DATE,
          allowNull: true,
        },
        read_at: {
          type: _sequelize.DataTypes.DATE,
          allowNull: true,
        },
        failed_reason: {
          type: _sequelize.DataTypes.TEXT,
          allowNull: true,
        },
        source: {
          type: _sequelize.DataTypes.STRING,
          allowNull: true,
          defaultValue: 'system',
        },
        reference_id: {
          type: _sequelize.DataTypes.STRING,
          allowNull: true,
        },
        reference_type: {
          type: _sequelize.DataTypes.STRING,
          allowNull: true,
        },
        expires_at: {
          type: _sequelize.DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'notifications',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );

    return this;
  }

  // Métodos de instância
  markAsSent() {
    this.status = 'sent';
    this.sent_at = new Date();
    return this.save();
  }

  markAsRead() {
    this.status = 'read';
    this.read_at = new Date();
    return this.save();
  }

  markAsFailed(reason) {
    this.status = 'failed';
    this.failed_reason = reason;
    return this.save();
  }

  isExpired() {
    return this.expires_at && new Date() > this.expires_at;
  }

  // Métodos estáticos
  static async findByUser(userName, options = {}) {
    const defaultOptions = {
      where: {
        [_sequelize.Op.or]: [
          { user_name: userName },
          { user_name: null }, // Notificações para todos
        ],
      },
      order: [['created_at', 'DESC']],
      limit: 50,
    };

    return this.findAll({ ...defaultOptions, ...options });
  }

  static async findUnreadByUser(userName) {
    return this.findByUser(userName, {
      where: {
        [_sequelize.Op.or]: [
          { user_name: userName },
          { user_name: null },
        ],
        status: ['pending', 'sent'],
      },
    });
  }

  static async markAllAsReadByUser(userName) {
    return this.update(
      {
        status: 'read',
        read_at: new Date(),
      },
      {
        where: {
          [_sequelize.Op.or]: [
            { user_name: userName },
            { user_name: null },
          ],
          status: ['pending', 'sent'],
        },
      }
    );
  }

  static async cleanupExpired() {
    return this.destroy({
      where: {
        expires_at: {
          [_sequelize.Op.lt]: new Date(),
        },
      },
    });
  }

  static async getStatistics() {
    const total = await this.count();
    const pending = await this.count({ where: { status: 'pending' } });
    const sent = await this.count({ where: { status: 'sent' } });
    const failed = await this.count({ where: { status: 'failed' } });
    const read = await this.count({ where: { status: 'read' } });

    return {
      total,
      pending,
      sent,
      failed,
      read,
      deliveryRate: total > 0 ? ((sent + read) / total * 100).toFixed(2) : 0,
    };
  }
} exports.default = Notification;
