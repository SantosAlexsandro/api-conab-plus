"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _webpush = require('web-push'); var _webpush2 = _interopRequireDefault(_webpush);
var _PushSubscription = require('../models/PushSubscription'); var _PushSubscription2 = _interopRequireDefault(_PushSubscription);
var _pushNotifications = require('../config/pushNotifications'); var _pushNotifications2 = _interopRequireDefault(_pushNotifications);

class PushNotificationService {
  constructor() {
    _webpush2.default.setVapidDetails(
      _pushNotifications2.default.subject,
      _pushNotifications2.default.vapidKeys.publicKey,
      _pushNotifications2.default.vapidKeys.privateKey
    );
  }

  /**
   * Envia uma notificação para um usuário específico
   */
  async sendToUser(userId, notification) {
    if (!userId) {
      throw new Error('ID do usuário não fornecido');
    }

    return this.sendNotification(notification, { user_id: userId });
  }

  /**
   * Envia uma notificação para todos os usuários
   */
  async sendToAll(notification) {
    return this.sendNotification(notification);
  }

  /**
   * Envia uma notificação para um endpoint específico
   */
  async sendToEndpoint(endpoint, notification) {
    if (!endpoint) {
      throw new Error('Endpoint não fornecido');
    }

    return this.sendNotification(notification, { endpoint });
  }

  /**
   * Método interno para enviar notificações com base em filtros
   */
  async sendNotification(notification, filters = {}) {
    const { title, body, icon, tag, data } = notification;

    if (!title || !body) {
      throw new Error('Título e corpo da notificação são obrigatórios');
    }

    // Trata o payload para compatibilidade com todos os clientes
    // Formato simplificado - mais direto e com menos aninhamento
    const payload = JSON.stringify({
      title,
      body, 
      icon: icon || '/icons/icon-192x192.png',
      tag: tag || 'default',
      data: data || {}
      // IMPORTANTE: Removemos a estrutura aninhada "notification" 
      // que estava causando confusão entre diferentes implementações
    });

    console.log('Payload formatado para web-push:', payload);

    const query = { active: true, ...filters };
    const subscriptions = await _PushSubscription2.default.findAll({ where: query });

    if (!subscriptions.length) {
      return {
        success: 0,
        failed: 0,
        errors: [],
        message: 'Nenhuma assinatura encontrada para enviar notificação',
      };
    }

    console.log(`Encontradas ${subscriptions.length} assinaturas para enviar notificação`);

    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const subscription of subscriptions) {
      try {
        console.log(`Enviando para ${subscription.endpoint.substring(0, 30)}...`);
        
        // Formata a subscription para o formato esperado pelo web-push
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
          expirationTime: subscription.expirationTime
        };
        
        await _webpush2.default.sendNotification(pushSubscription, payload);
        console.log('Notificação enviada com sucesso');
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

    results.message = `Notificações enviadas: ${results.success} com sucesso, ${results.failed} falhas`;
    return results;
  }

  /**
   * Salva uma nova assinatura
   */
  async saveSubscription(subscription, userId = null) {
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      throw new Error('Dados de assinatura inválidos');
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
        user_id: userId,
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

    return subscriptionRecord;
  }

  /**
   * Remove uma assinatura
   */
  async removeSubscription(endpoint) {
    if (!endpoint) {
      throw new Error('Endpoint não fornecido');
    }

    const subscription = await _PushSubscription2.default.findOne({
      where: { endpoint },
    });

    if (!subscription) {
      throw new Error('Assinatura não encontrada');
    }

    await subscription.update({ active: false });
    return subscription;
  }

  /**
   * Recupera a chave pública VAPID
   */
  getPublicKey() {
    return _pushNotifications2.default.vapidKeys.publicKey;
  }

  /**
   * Retorna as assinaturas com base em filtros
   * @param {Object} filters - Filtros para busca de assinaturas
   * @returns {Promise<Array>} Lista de assinaturas
   */
  async getSubscriptions(filters = {}) {
    const query = { ...filters };
    
    return _PushSubscription2.default.findAll({
      where: query,
      attributes: ['id', 'endpoint', 'expirationTime', 'p256dh', 'auth', 'user_id', 'active', 'created_at', 'updated_at'],
    });
  }
}

exports. default = new PushNotificationService();
