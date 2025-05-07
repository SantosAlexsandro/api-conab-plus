"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _webpush = require('web-push'); var _webpush2 = _interopRequireDefault(_webpush);
var _PushSubscription = require('../models/PushSubscription'); var _PushSubscription2 = _interopRequireDefault(_PushSubscription);
var _pushNotifications = require('../config/pushNotifications'); var _pushNotifications2 = _interopRequireDefault(_pushNotifications);

class PushNotificationController {
  constructor() {
    _webpush2.default.setVapidDetails(
      _pushNotifications2.default.subject,
      _pushNotifications2.default.vapidKeys.publicKey,
      _pushNotifications2.default.vapidKeys.privateKey
    );
  }

  async getPublicKey(req, res) {
    return res.json({
      publicKey: _pushNotifications2.default.vapidKeys.publicKey,
    });
  }

  async subscribe(req, res) {
    try {
      const { subscription, userId } = req.body;

      if (!subscription || !subscription.endpoint || !subscription.keys) {
        return res.status(400).json({
          error: 'Dados de assinatura inválidos',
        });
      }

      const [subscriptionRecord, created] = await _PushSubscription2.default.findOrCreate({
        where: {
          endpoint: subscription.endpoint,
        },
        defaults: {
          endpoint: subscription.endpoint,
          expirationTime: subscription.expirationTime || null,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          user_id: userId || null,
          active: true,
        },
      });

      if (!created) {
        // Atualiza a assinatura existente
        await subscriptionRecord.update({
          expirationTime: subscription.expirationTime || null,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          user_id: userId || subscriptionRecord.user_id,
          active: true,
        });
      }

      return res.status(201).json({ message: 'Assinatura registrada com sucesso' });
    } catch (error) {
      console.error('Erro ao registrar assinatura:', error);
      return res.status(500).json({
        error: 'Erro ao processar assinatura',
      });
    }
  }

  async unsubscribe(req, res) {
    try {
      const { endpoint } = req.body;

      if (!endpoint) {
        return res.status(400).json({
          error: 'Endpoint não fornecido',
        });
      }

      const subscription = await _PushSubscription2.default.findOne({
        where: { endpoint },
      });

      if (!subscription) {
        return res.status(404).json({
          error: 'Assinatura não encontrada',
        });
      }

      await subscription.update({ active: false });

      return res.json({ message: 'Assinatura cancelada com sucesso' });
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      return res.status(500).json({
        error: 'Erro ao processar cancelamento de assinatura',
      });
    }
  }

  async sendNotification(req, res) {
    try {
      const { title, body, icon, tag, data, userId, endpoint } = req.body;

      if (!title || !body) {
        return res.status(400).json({
          error: 'Título e corpo da notificação são obrigatórios',
        });
      }

      const payload = JSON.stringify({
        notification: {
          title,
          body,
          icon: icon || '/icon-192x192.png',
          tag: tag || 'default',
          data: data || {},
        }
      });

      const query = { active: true };

      if (userId) {
        query.user_id = userId;
      }

      if (endpoint) {
        query.endpoint = endpoint;
      }

      const subscriptions = await _PushSubscription2.default.findAll({
        where: query,
      });

      if (!subscriptions.length) {
        return res.status(404).json({
          error: 'Nenhuma assinatura encontrada para enviar notificação',
        });
      }

      const results = {
        success: 0,
        failed: 0,
        errors: [],
      };

      for (const subscription of subscriptions) {
        try {
          await _webpush2.default.sendNotification({
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
            expirationTime: subscription.expirationTime,
          }, payload);

          results.success++;
        } catch (error) {
          console.error('Erro ao enviar notificação:', error);

          results.failed++;
          results.errors.push({
            subscription: subscription.endpoint,
            error: error.message,
          });

          // Se a assinatura não for mais válida, desative-a
          if (error.statusCode === 410) {
            await subscription.update({ active: false });
          }
        }
      }

      return res.json({
        message: `Notificações enviadas: ${results.success} com sucesso, ${results.failed} falhas`,
        results,
      });
    } catch (error) {
      console.error('Erro ao enviar notificações:', error);
      return res.status(500).json({
        error: 'Erro ao processar envio de notificações',
      });
    }
  }

  async listSubscriptions(req, res) {
    try {
      const { userId } = req.query;
      const query = { active: true };

      if (userId) {
        query.user_id = userId;
      }

      const subscriptions = await _PushSubscription2.default.findAll({
        where: query,
        attributes: ['id', 'endpoint', 'expirationTime', 'user_id', 'active', 'created_at', 'updated_at'],
      });

      return res.json(subscriptions);
    } catch (error) {
      console.error('Erro ao listar assinaturas:', error);
      return res.status(500).json({
        error: 'Erro ao processar listagem de assinaturas',
      });
    }
  }
}

exports. default = new PushNotificationController();
