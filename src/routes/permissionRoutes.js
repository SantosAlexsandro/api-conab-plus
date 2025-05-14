import { Router } from 'express';
import PermissionController from '../controllers/PermissionController';
import authUser from '../middlewares/authUser';
import checkPermission from '../middlewares/checkPermission';

const routes = Router();

// Rotas protegidas por autenticação e permissão
routes.use(authUser);

// Listar permissões
routes.get('/', checkPermission('permissions.view'), PermissionController.index);

// Criar permissão
routes.post('/', checkPermission('permissions.create'), PermissionController.create);

export default routes;
