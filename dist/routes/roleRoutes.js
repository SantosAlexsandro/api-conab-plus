"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _RoleController = require('../controllers/RoleController'); var _RoleController2 = _interopRequireDefault(_RoleController);
var _authUser = require('../middlewares/authUser'); var _authUser2 = _interopRequireDefault(_authUser);
var _checkPermission = require('../middlewares/checkPermission'); var _checkPermission2 = _interopRequireDefault(_checkPermission);

const routes = _express.Router.call(void 0, );

// Rotas protegidas por autenticação e permissão
routes.use(_authUser2.default);

// Listar perfis
routes.get('/', _checkPermission2.default.call(void 0, 'roles.view'), _RoleController2.default.index);

// Buscar perfil por ID
routes.get('/:id', _checkPermission2.default.call(void 0, 'roles.view'), _RoleController2.default.show);

// Criar perfil
routes.post('/', _checkPermission2.default.call(void 0, 'roles.create'), _RoleController2.default.create);

// Atualizar perfil
routes.put('/:id', _checkPermission2.default.call(void 0, 'roles.edit'), _RoleController2.default.update);

// Excluir perfil
routes.delete('/:id', _checkPermission2.default.call(void 0, 'roles.delete'), _RoleController2.default.delete);

// Atribuir permissões a um perfil
routes.post('/:id/permissions', _checkPermission2.default.call(void 0, 'roles.assign_permissions'), _RoleController2.default.assignPermissions);

// Remover permissão de um perfil
routes.delete('/:roleId/permissions/:permissionId', _checkPermission2.default.call(void 0, 'roles.assign_permissions'), _RoleController2.default.removePermission);

exports. default = routes;
