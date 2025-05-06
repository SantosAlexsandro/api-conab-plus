import { Router } from 'express';
import PushNotificationController from '../controllers/PushNotificationController';
import authUser from '../middlewares/authUser';
import PushSubscription from '../models/PushSubscription';

const router = new Router();

// Rota pública para obter a chave VAPID pública
router.get('/vapid-public-key', PushNotificationController.getPublicKey);

// Rota de teste para criar uma assinatura de demonstração
router.get('/create-test-subscription', async (req, res) => {
  try {
    // Verificar se já existe a assinatura de teste
    const existingSubscription = await PushSubscription.findOne({
      where: { endpoint: 'https://test-endpoint.example.com' }
    });

    if (existingSubscription) {
      return res.json({
        message: 'Assinatura de teste já existe',
        subscription: existingSubscription
      });
    }

    // Criar uma assinatura de teste
    const subscription = await PushSubscription.create({
      endpoint: 'https://test-endpoint.example.com',
      p256dh: 'BLc4xRzKlKORKWlbdgFaBrrHzTBuVVtMb70hUkdVMurX9V1P7Ga_4FPCdTgNLEUh0X9rrHUiS6fP3eddQQrK9HE',
      auth: 'Q2BoAjC09xH3ywDLNJr-dA',
      expirationTime: null,
      user_id: 1,
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.json({
      message: 'Assinatura de teste criada com sucesso',
      subscription
    });
  } catch (error) {
    console.error('Erro ao criar assinatura de teste:', error);
    return res.status(500).json({
      error: 'Erro ao criar assinatura de teste',
      details: error.message
    });
  }
});

// Rota de teste para enviar uma notificação
router.get('/test-send-notification', (req, res) => {
  // Mock do corpo da requisição para o controlador
  req.body = {
    title: 'Notificação de Teste',
    body: 'Esta é uma notificação de teste enviada manualmente.',
    icon: '/icon-192x192.png',
    data: { url: '/dashboard' }
  };

  // Chamando o método do controlador
  return PushNotificationController.sendNotification(req, res);
});

// Rotas protegidas por autenticação
// Para testes, deixamos sem autenticação, mas em produção deve usar authUser
router.post('/subscribe', PushNotificationController.subscribe);
router.post('/unsubscribe', PushNotificationController.unsubscribe);

// Rotas administrativas
// Para testes, deixamos sem autenticação, mas em produção deve usar authUser
router.get('/subscriptions', PushNotificationController.listSubscriptions);
router.post('/send', PushNotificationController.sendNotification);

export default router;
