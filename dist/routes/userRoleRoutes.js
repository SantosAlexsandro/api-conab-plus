"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _UserRoleController = require('../controllers/UserRoleController'); var _UserRoleController2 = _interopRequireDefault(_UserRoleController);
var _authUser = require('../middlewares/authUser'); var _authUser2 = _interopRequireDefault(_authUser);
var _checkPermission = require('../middlewares/checkPermission'); var _checkPermission2 = _interopRequireDefault(_checkPermission);

const routes = _express.Router.call(void 0, );

// Rotas protegidas por autenticação e permissão
routes.use(_authUser2.default);

// Buscar perfis de um usuário - A verificação de permissão será feita no controller
routes.get('/:userName/roles', _UserRoleController2.default.getUserRoles);

// Atribuir perfil a um usuário
routes.post('/:userName/roles', _checkPermission2.default.call(void 0, 'users.assign_roles'), _UserRoleController2.default.assignRole);

// Remover perfil de um usuário
routes.delete('/:userName/roles/:roleId', _checkPermission2.default.call(void 0, 'users.assign_roles'), _UserRoleController2.default.removeRole);

exports. default = routes;
