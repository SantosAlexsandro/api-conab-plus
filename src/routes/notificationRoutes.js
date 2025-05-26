import { Router } from 'express';
import NotificationController from '../controllers/NotificationController';
import authUser from '../middlewares/authUser';
import checkPermission from '../middlewares/checkPermission';

const routes = Router();

// Middleware de autenticação para todas as rotas
routes.use(authUser);

// Rotas públicas (para usuários autenticados)
routes.get('/', NotificationController.index);
routes.get('/unread-count', NotificationController.getUnreadCount);
routes.put('/:id/read', NotificationController.markAsRead);
routes.put('/read-all', NotificationController.markAllAsRead);

// Rotas administrativas (requerem permissões específicas)
routes.post('/', checkPermission(['notifications.create']), NotificationController.create);
routes.get('/statistics', checkPermission(['notifications.view']), NotificationController.getStatistics);
routes.post('/cleanup', checkPermission(['notifications.manage']), NotificationController.cleanup);

export default routes;
