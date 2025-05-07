"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _PushNotificationController = require('../controllers/PushNotificationController'); var _PushNotificationController2 = _interopRequireDefault(_PushNotificationController);
var _authUser = require('../middlewares/authUser'); var _authUser2 = _interopRequireDefault(_authUser);
var _PushSubscription = require('../models/PushSubscription'); var _PushSubscription2 = _interopRequireDefault(_PushSubscription);

const router = new (0, _express.Router)();

// Rota pública para obter a chave VAPID pública
router.get('/vapid-public-key', _PushNotificationController2.default.getPublicKey);

// Rota de teste para criar uma assinatura de demonstração
router.get('/create-test-subscription', async (req, res) => {
  try {
    // Verificar se já existe a assinatura de teste
    const existingSubscription = await _PushSubscription2.default.findOne({
      where: { endpoint: 'https://test-endpoint.example.com' }
    });

    if (existingSubscription) {
      return res.json({
        message: 'Assinatura de teste já existe',
        subscription: existingSubscription
      });
    }

    // Criar uma assinatura de teste
    const subscription = await _PushSubscription2.default.create({
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
  return _PushNotificationController2.default.sendNotification(req, res);
});

// Rotas protegidas por autenticação
// Para testes, deixamos sem autenticação, mas em produção deve usar authUser
router.post('/subscribe', _PushNotificationController2.default.subscribe);
router.post('/unsubscribe', _PushNotificationController2.default.unsubscribe);

// Rotas administrativas
// Para testes, deixamos sem autenticação, mas em produção deve usar authUser
router.get('/subscriptions', _PushNotificationController2.default.listSubscriptions);
router.post('/send', _PushNotificationController2.default.sendNotification);

exports. default = router;
