"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _Notification = require('../models/Notification'); var _Notification2 = _interopRequireDefault(_Notification);
var _PushNotificationService = require('./PushNotificationService'); var _PushNotificationService2 = _interopRequireDefault(_PushNotificationService);
var _jsonwebtoken = require('jsonwebtoken'); var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);
var _sequelize = require('sequelize');

class NotificationService {
  /**
   * Extrai userName do token JWT
   */
  getUserNameFromToken(token) {
    try {
      if (!token) return null;

      const decoded = _jsonwebtoken2.default.verify(token, process.env.JWT_TOKEN_SECRET);
      return decoded.userName || null;
    } catch (error) {
      console.error('[NotificationService] Error extracting username from token:', error);
      return null;
    }
  }

  /**
   * Cria uma nova notificação no banco de dados
   */
  async createNotification({
    userName = null, // null = para todos os usuários
    title,
    body,
    type,
    priority = 'normal',
    channels = ['push'],
    data = {},
    source = 'system',
    referenceId = null,
    referenceType = null,
    expiresAt = null,
    metadata = {}
  }) {
    try {
      console.log('[NotificationService] Creating notification:', { title, type, userName });

      const notification = await _Notification2.default.create({
        user_name: userName,
        title,
        body,
        type,
        priority,
        status: 'pending',
        channels,
        data,
        source,
        reference_id: referenceId,
        reference_type: referenceType,
        expires_at: expiresAt,
        metadata
      });

      console.log('[NotificationService] Notification created with ID:', notification.id);
      return notification;
    } catch (error) {
      console.error('[NotificationService] Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Envia uma notificação (cria no banco e tenta entregar)
   */
  async sendNotification({
    userName = null,
    title,
    body,
    type,
    priority = 'normal',
    channels = ['push'],
    data = {},
    source = 'system',
    referenceId = null,
    referenceType = null,
    expiresAt = null,
    metadata = {}
  }) {
    try {
      // 1. Criar notificação no banco
      const notification = await this.createNotification({
        userName,
        title,
        body,
        type,
        priority,
        channels,
        data,
        source,
        referenceId,
        referenceType,
        expiresAt,
        metadata
      });

      // 2. Tentar entregar via push (se estiver nos canais)
      if (channels.includes('push')) {
        try {
          const pushPayload = {
            title,
            body,
            icon: '/icons/icon-192x192.png',
            tag: type,
            data: {
              notificationId: notification.id,
              ...data
            }
          };

          let pushResult;
          if (userName) {
            // Enviar para usuário específico
            pushResult = await _PushNotificationService2.default.sendToUser(userName, pushPayload);
          } else {
            // Enviar para todos
            pushResult = await _PushNotificationService2.default.sendToAll(pushPayload);
          }

          console.log('[NotificationService] Push sent successfully:', pushResult);

          // Marcar como enviada
          await notification.markAsSent();

        } catch (pushError) {
          console.error('[NotificationService] Push delivery failed:', pushError);

          // Marcar como falhada
          await notification.markAsFailed(pushError.message);
        }
      } else {
        // Se não tem push, marcar como enviada (outros canais podem ser implementados)
        await notification.markAsSent();
      }

      return notification;
    } catch (error) {
      console.error('[NotificationService] Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Busca notificações de um usuário
   */
  async getUserNotifications(userName, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status = null,
        type = null,
        unreadOnly = false
      } = options;

      const whereConditions = {
        [_sequelize.Op.or]: [
          { user_name: userName },
          { user_name: null } // Notificações para todos
        ]
      };

      if (status) {
        whereConditions.status = status;
      }

      if (type) {
        whereConditions.type = type;
      }

      if (unreadOnly) {
        whereConditions.status = ['pending', 'sent'];
      }

      const offset = (page - 1) * limit;

      const result = await _Notification2.default.findAndCountAll({
        where: whereConditions,
        order: [['created_at', 'DESC']],
        limit,
        offset
      });

      return {
        notifications: result.rows,
        total: result.count,
        page,
        totalPages: Math.ceil(result.count / limit),
        hasNext: page < Math.ceil(result.count / limit),
        hasPrevious: page > 1
      };
    } catch (error) {
      console.error('[NotificationService] Error fetching user notifications:', error);
      throw error;
    }
  }

  /**
   * Conta notificações não lidas de um usuário
   */
  async getUnreadCount(userName) {
    try {
      return await _Notification2.default.count({
        where: {
          [_sequelize.Op.or]: [
            { user_name: userName },
            { user_name: null }
          ],
          status: ['pending', 'sent']
        }
      });
    } catch (error) {
      console.error('[NotificationService] Error counting unread notifications:', error);
      throw error;
    }
  }

  /**
   * Marca uma notificação como lida
   */
  async markAsRead(notificationId, userName = null) {
    try {
      const whereConditions = { id: notificationId };

      // Se userName for fornecido, verificar se a notificação pertence ao usuário
      if (userName) {
        whereConditions[_sequelize.Op.or] = [
          { user_name: userName },
          { user_name: null }
        ];
      }

      const notification = await _Notification2.default.findOne({ where: whereConditions });

      if (!notification) {
        throw new Error('Notificação não encontrada');
      }

      if (notification.status !== 'read') {
        await notification.markAsRead();
      }

      return notification;
    } catch (error) {
      console.error('[NotificationService] Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Marca todas as notificações de um usuário como lidas
   */
  async markAllAsRead(userName) {
    try {
      const result = await _Notification2.default.markAllAsReadByUser(userName);
      console.log(`[NotificationService] Marked ${result[0]} notifications as read for user ${userName}`);
      return result[0]; // Retorna o número de registros atualizados
    } catch (error) {
      console.error('[NotificationService] Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Remove notificações antigas/expiradas
   */
  async cleanupExpiredNotifications() {
    try {
      const deletedCount = await _Notification2.default.cleanupExpired();
      console.log(`[NotificationService] Cleaned up ${deletedCount} expired notifications`);
      return deletedCount;
    } catch (error) {
      console.error('[NotificationService] Error cleaning up expired notifications:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de notificações
   */
  async getStatistics() {
    try {
      return await _Notification2.default.getStatistics();
    } catch (error) {
      console.error('[NotificationService] Error getting statistics:', error);
      throw error;
    }
  }

  /**
   * Método de conveniência para notificações de ordem de serviço
   */
  async sendWorkOrderNotification(type, workOrderNumber, customerName, uraRequestId, technicianInfo = null) {
    const notificationTypes = {
      'work_order_created': {
        title: 'Nova Ordem de Serviço Criada',
        body: `Ordem de Serviço ${workOrderNumber} foi criada para ${customerName}`
      },
      'technician_assigned': {
        title: 'Técnico Atribuído',
        body: `Técnico ${_optionalChain([technicianInfo, 'optionalAccess', _ => _.name])} foi atribuído à Ordem de Serviço ${workOrderNumber}`
      }
    };

    const config = notificationTypes[type];
    if (!config) {
      throw new Error(`Tipo de notificação não suportado: ${type}`);
    }

    return await this.sendNotification({
      title: config.title,
      body: config.body,
      type,
      priority: 'high',
      channels: ['push'],
      data: {
        type,
        workOrderNumber,
        customerName,
        uraRequestId,
        technicianName: _optionalChain([technicianInfo, 'optionalAccess', _2 => _2.name]),
        technicianId: _optionalChain([technicianInfo, 'optionalAccess', _3 => _3.id]),
        url: `/trabalho-ordens/${workOrderNumber}`
      },
      source: 'g4flex',
      referenceId: workOrderNumber,
      referenceType: 'work_order'
    });
  }

  /**
   * Extrai userName do token JWT da request
   */
  getUserNameFromRequest(req) {
    try {
      const token = _optionalChain([req, 'access', _4 => _4.headers, 'access', _5 => _5.authorization, 'optionalAccess', _6 => _6.replace, 'call', _7 => _7('Bearer ', '')]);
      if (!token) return null;

      return this.getUserNameFromToken(token);
    } catch (error) {
      console.error('[NotificationService] Error extracting username from token:', error);
      return null;
    }
  }
}

exports. default = new NotificationService();
