import PushNotificationService from '../services/PushNotificationService';

class PushNotificationController {
  async getPublicKey(req, res) {
    try {
      const publicKey = PushNotificationService.getPublicKey();

      return res.json({ publicKey });
    } catch (error) {
      console.error('Erro ao obter chave pública VAPID:', error);
      return res.status(500).json({
        error: 'Erro ao obter chave pública',
      });
    }
  }

  async subscribe(req, res) {
    try {
      const { subscription, userId } = req.body;

      if (!subscription || !subscription.endpoint || !subscription.keys) {
        return res.status(400).json({
          error: 'Dados de assinatura inválidos',
        });
      }

      await PushNotificationService.saveSubscription(subscription, userId);

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

      try {
        await PushNotificationService.removeSubscription(endpoint);
        return res.json({ message: 'Assinatura cancelada com sucesso' });
      } catch (error) {
        if (error.message === 'Assinatura não encontrada') {
          return res.status(404).json({
            error: 'Assinatura não encontrada',
          });
        }
        throw error;
      }
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

      console.log('Requisição de notificação recebida (Postman/API):', {
        title, body, userId, endpoint
      });

      if (!title || !body) {
        return res.status(400).json({
          error: 'Título e corpo da notificação são obrigatórios',
        });
      }

      // Assegura que o formato de dados está consistente
      const notificationData = {
        title,
        body,
        // Usa valores default se não forem fornecidos
        icon: icon || '/icons/icon-192x192.png',
        tag: tag || 'default',
        // Garante que data é um objeto
        data: typeof data === 'object' && data !== null ? data : { message: data || '' }
      };

      console.log('Dados normalizados para envio:', notificationData);

      let result;

      try {
        if (userId) {
          console.log(`Enviando notificação para usuário: ${userId}`);
          result = await PushNotificationService.sendToUser(userId, notificationData);
        } else if (endpoint) {
          console.log(`Enviando notificação para endpoint: ${endpoint.substr(0, 30)}...`);
          result = await PushNotificationService.sendToEndpoint(endpoint, notificationData);
        } else {
          console.log('Enviando notificação para todos os usuários');
          result = await PushNotificationService.sendToAll(notificationData);
        }

        console.log('Resultado do envio:', result);
      } catch (sendError) {
        console.error('Erro durante o envio da notificação:', sendError);
        throw sendError;
      }

      if (result.success === 0 && result.failed === 0) {
        return res.status(404).json({
          error: 'Nenhuma assinatura encontrada para enviar notificação',
        });
      }

      return res.json(result);
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
      const filters = { active: true };

      if (userId) {
        filters.user_id = userId;
      }

      const subscriptions = await PushNotificationService.getSubscriptions(filters);

      return res.json(subscriptions);
    } catch (error) {
      console.error('Erro ao listar assinaturas:', error);
      return res.status(500).json({
        error: 'Erro ao processar listagem de assinaturas',
      });
    }
  }
}

export default new PushNotificationController();
