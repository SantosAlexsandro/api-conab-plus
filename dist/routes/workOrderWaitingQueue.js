"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _WorkOrderWaitingQueueController = require('../controllers/WorkOrderWaitingQueueController'); var _WorkOrderWaitingQueueController2 = _interopRequireDefault(_WorkOrderWaitingQueueController);
var _authUser = require('../middlewares/authUser'); var _authUser2 = _interopRequireDefault(_authUser);
var _checkPermission = require('../middlewares/checkPermission'); var _checkPermission2 = _interopRequireDefault(_checkPermission);

const routes = new (0, _express.Router)();

// Middleware de autenticação aplicado a todas as rotas
routes.use(_authUser2.default);

// Listar todas as ordens na fila (com opção de filtrar por status)
routes.get('/', _checkPermission2.default.call(void 0, 'workorder_queue.view'), _WorkOrderWaitingQueueController2.default.index);

// Buscar detalhes de uma ordem por ID
// Descomentar quando o método estiver implementado
//routes.get('/id/:id', checkPermission('workorder_queue.view_details'), WorkOrderWaitingQueueController.show);

// Buscar por número da ordem
// Descomentar quando o método estiver implementado
//routes.get('/order/:orderNumber', checkPermission('workorder_queue.view_details'), WorkOrderWaitingQueueController.findByOrderNumber);

// Buscar por ID da requisição da URA
// Descomentar quando o método estiver implementado
//routes.get('/ura/:uraRequestId', checkPermission('workorder_queue.view_details'), WorkOrderWaitingQueueController.findByUraRequestId);

// Retornar as opções de status para uso no frontend
// Descomentar quando o método estiver implementado
//routes.get('/options', checkPermission('workorder_queue.view_options'), WorkOrderWaitingQueueController.getStatusOptions);

// Endpoints adicionais que podem ser necessários:

// Atualizar o status de uma ordem de serviço na fila
//routes.put('/:id/status', checkPermission('workorder_queue.update_status'), WorkOrderWaitingQueueController.updateStatus);

// Atribuir uma ordem de serviço da fila a um técnico
//routes.put('/:id/assign', checkPermission('workorder_queue.assign'), WorkOrderWaitingQueueController.assignTechnician);

exports. default = routes;
