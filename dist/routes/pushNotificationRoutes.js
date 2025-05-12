"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _PushNotificationController = require('../controllers/PushNotificationController'); var _PushNotificationController2 = _interopRequireDefault(_PushNotificationController);
var _authUser = require('../middlewares/authUser'); var _authUser2 = _interopRequireDefault(_authUser);
var _PushSubscription = require('../models/PushSubscription'); var _PushSubscription2 = _interopRequireDefault(_PushSubscription);

const router = new (0, _express.Router)();

// Rota pública para obter a chave VAPID pública
router.get('/vapid-public-key', _PushNotificationController2.default.getPublicKey);

// Rotas protegidas por autenticação
// Para testes, deixamos sem autenticação, mas em produção deve usar authUser
router.post('/subscribe', _PushNotificationController2.default.subscribe);
router.post('/unsubscribe', _PushNotificationController2.default.unsubscribe);

// Rotas administrativas
// Para testes, deixamos sem autenticação, mas em produção deve usar authUser
router.get('/subscriptions', _PushNotificationController2.default.listSubscriptions);
router.post('/send', _PushNotificationController2.default.sendNotification);

exports. default = router;
