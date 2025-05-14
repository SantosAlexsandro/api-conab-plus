import { Router } from 'express';
import RoleController from '../controllers/RoleController';
import authUser from '../middlewares/authUser';
import checkPermission from '../middlewares/checkPermission';

const routes = Router();

// Rotas protegidas por autenticação e permissão
routes.use(authUser);

// Listar perfis
routes.get('/', checkPermission('roles.view'), RoleController.index);

// Buscar perfil por ID
routes.get('/:id', checkPermission('roles.view'), RoleController.show);

// Criar perfil
routes.post('/', checkPermission('roles.create'), RoleController.create);

// Atualizar perfil
routes.put('/:id', checkPermission('roles.edit'), RoleController.update);

// Excluir perfil
routes.delete('/:id', checkPermission('roles.delete'), RoleController.delete);

// Atribuir permissões a um perfil
routes.post('/:id/permissions', checkPermission('roles.assign_permissions'), RoleController.assignPermissions);

// Remover permissão de um perfil
routes.delete('/:roleId/permissions/:permissionId', checkPermission('roles.assign_permissions'), RoleController.removePermission);

export default routes;
