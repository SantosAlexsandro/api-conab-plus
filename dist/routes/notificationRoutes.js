"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _NotificationController = require('../controllers/NotificationController'); var _NotificationController2 = _interopRequireDefault(_NotificationController);
var _authUser = require('../middlewares/authUser'); var _authUser2 = _interopRequireDefault(_authUser);
var _checkPermission = require('../middlewares/checkPermission'); var _checkPermission2 = _interopRequireDefault(_checkPermission);

const routes = _express.Router.call(void 0, );

// Middleware de autenticação para todas as rotas
routes.use(_authUser2.default);

// Rotas públicas (para usuários autenticados)
routes.get('/', _NotificationController2.default.index);
routes.get('/unread-count', _NotificationController2.default.getUnreadCount);
routes.put('/:id/read', _NotificationController2.default.markAsRead);
routes.put('/read-all', _NotificationController2.default.markAllAsRead);

// Rotas administrativas (requerem permissões específicas)
routes.post('/', _checkPermission2.default.call(void 0, ['notifications.create']), _NotificationController2.default.create);
routes.get('/statistics', _checkPermission2.default.call(void 0, ['notifications.view']), _NotificationController2.default.getStatistics);
routes.post('/cleanup', _checkPermission2.default.call(void 0, ['notifications.manage']), _NotificationController2.default.cleanup);

exports. default = routes;
