"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _PermissionController = require('../controllers/PermissionController'); var _PermissionController2 = _interopRequireDefault(_PermissionController);
var _authUser = require('../middlewares/authUser'); var _authUser2 = _interopRequireDefault(_authUser);
var _checkPermission = require('../middlewares/checkPermission'); var _checkPermission2 = _interopRequireDefault(_checkPermission);

const routes = _express.Router.call(void 0, );

// Rotas protegidas por autenticação e permissão
routes.use(_authUser2.default);

// Listar permissões
routes.get('/', _checkPermission2.default.call(void 0, 'permissions.view'), _PermissionController2.default.index);

// Criar permissão
routes.post('/', _checkPermission2.default.call(void 0, 'permissions.create'), _PermissionController2.default.create);

exports. default = routes;
