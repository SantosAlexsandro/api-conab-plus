import { Router } from 'express';
import UserRoleController from '../controllers/UserRoleController';
import authUser from '../middlewares/authUser';
import checkPermission from '../middlewares/checkPermission';

const routes = Router();

// Rotas protegidas por autenticação e permissão
routes.use(authUser);

// Buscar perfis de um usuário - A verificação de permissão será feita no controller
routes.get('/:userName/roles', UserRoleController.getUserRoles);

// Atribuir perfil a um usuário
routes.post('/:userName/roles', checkPermission('users.assign_roles'), UserRoleController.assignRole);

// Remover perfil de um usuário
routes.delete('/:userName/roles/:roleId', checkPermission('users.assign_roles'), UserRoleController.removeRole);

export default routes;
