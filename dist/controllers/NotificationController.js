"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _NotificationService = require('../services/NotificationService'); var _NotificationService2 = _interopRequireDefault(_NotificationService);

class NotificationController {
  /**
   * Listar notificações do usuário logado
   * GET /api/notifications
   */
  async index(req, res) {
    try {
      const userName = _NotificationService2.default.getUserNameFromRequest(req);
      if (!userName) {
        return res.status(401).json({ error: 'Token de autenticação inválido' });
      }

      const {
        page = 1,
        limit = 20,
        status,
        type,
        unreadOnly = false
      } = req.query;

      const result = await _NotificationService2.default.getUserNotifications(userName, {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        type,
        unreadOnly: unreadOnly === 'true'
      });

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('[NotificationController] Error fetching notifications:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Contar notificações não lidas
   * GET /api/notifications/unread-count
   */
  async getUnreadCount(req, res) {
    try {
      const userName = _NotificationService2.default.getUserNameFromRequest(req);
      if (!userName) {
        return res.status(401).json({ error: 'Token de autenticação inválido' });
      }

      const count = await _NotificationService2.default.getUnreadCount(userName);

      return res.json({
        success: true,
        data: { unreadCount: count }
      });
    } catch (error) {
      console.error('[NotificationController] Error counting unread notifications:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Marcar notificação como lida
   * PUT /api/notifications/:id/read
   */
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userName = _NotificationService2.default.getUserNameFromRequest(req);

      if (!userName) {
        return res.status(401).json({ error: 'Token de autenticação inválido' });
      }

      const notification = await _NotificationService2.default.markAsRead(parseInt(id), userName);

      return res.json({
        success: true,
        data: notification
      });
    } catch (error) {
      console.error('[NotificationController] Error marking notification as read:', error);

      if (error.message === 'Notificação não encontrada') {
        return res.status(404).json({
          success: false,
          error: 'Notificação não encontrada'
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Marcar todas as notificações como lidas
   * PUT /api/notifications/read-all
   */
  async markAllAsRead(req, res) {
    try {
      const userName = _NotificationService2.default.getUserNameFromRequest(req);
      if (!userName) {
        return res.status(401).json({ error: 'Token de autenticação inválido' });
      }

      const updatedCount = await _NotificationService2.default.markAllAsRead(userName);

      return res.json({
        success: true,
        data: { updatedCount }
      });
    } catch (error) {
      console.error('[NotificationController] Error marking all notifications as read:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Criar notificação (apenas para admins)
   * POST /api/notifications
   */
  async create(req, res) {
    try {
      const {
        userName = null,
        title,
        body,
        type,
        priority = 'normal',
        channels = ['push'],
        data = {},
        source = 'manual',
        referenceId = null,
        referenceType = null,
        expiresAt = null
      } = req.body;

      // Validação básica
      if (!title || !body || !type) {
        return res.status(400).json({
          success: false,
          error: 'Título, corpo e tipo são obrigatórios'
        });
      }

      const notification = await _NotificationService2.default.sendNotification({
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
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        metadata: {
          createdBy: _NotificationService2.default.getUserNameFromRequest(req),
          userAgent: req.headers['user-agent'],
          ip: req.ip
        }
      });

      return res.status(201).json({
        success: true,
        data: notification
      });
    } catch (error) {
      console.error('[NotificationController] Error creating notification:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter estatísticas de notificações (apenas para admins)
   * GET /api/notifications/statistics
   */
  async getStatistics(req, res) {
    try {
      const statistics = await _NotificationService2.default.getStatistics();

      return res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('[NotificationController] Error getting statistics:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Limpeza de notificações expiradas (apenas para admins)
   * POST /api/notifications/cleanup
   */
  async cleanup(req, res) {
    try {
      const deletedCount = await _NotificationService2.default.cleanupExpiredNotifications();

      return res.json({
        success: true,
        data: { deletedCount }
      });
    } catch (error) {
      console.error('[NotificationController] Error cleaning up notifications:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
}

exports. default = new NotificationController();
