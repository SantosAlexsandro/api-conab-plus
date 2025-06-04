"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _WorkOrderWaitingQueueController = require('../controllers/WorkOrderWaitingQueueController'); var _WorkOrderWaitingQueueController2 = _interopRequireDefault(_WorkOrderWaitingQueueController);
var _authUser = require('../middlewares/authUser'); var _authUser2 = _interopRequireDefault(_authUser);
var _checkPermission = require('../middlewares/checkPermission'); var _checkPermission2 = _interopRequireDefault(_checkPermission);

const router = new (0, _express.Router)();

// Middleware de autenticação aplicado a todas as rotas
router.use(_authUser2.default);

// Pausar atribuição de técnico para uma ordem específica
router.post('/:orderNumber/pause-technician-assignment', _WorkOrderWaitingQueueController2.default.pauseTechnicianAssignment);

// Retomar atribuição de técnico para uma ordem específica
router.post('/:orderNumber/resume-technician-assignment', _WorkOrderWaitingQueueController2.default.resumeTechnicianAssignment);

// Listar todas as ordens na fila (com opção de filtrar por status)
router.get('/', _checkPermission2.default.call(void 0, 'workorder_queue.view'), _WorkOrderWaitingQueueController2.default.index);

exports. default = router;
