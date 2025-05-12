import { Router } from 'express';
import PushNotificationController from '../controllers/PushNotificationController';
import authUser from '../middlewares/authUser';
import PushSubscription from '../models/PushSubscription';

const router = new Router();

// Rota pública para obter a chave VAPID pública
router.get('/vapid-public-key', PushNotificationController.getPublicKey);

// Rotas protegidas por autenticação
// Para testes, deixamos sem autenticação, mas em produção deve usar authUser
router.post('/subscribe', PushNotificationController.subscribe);
router.post('/unsubscribe', PushNotificationController.unsubscribe);

// Rotas administrativas
// Para testes, deixamos sem autenticação, mas em produção deve usar authUser
router.get('/subscriptions', PushNotificationController.listSubscriptions);
router.post('/send', PushNotificationController.sendNotification);

export default router;
