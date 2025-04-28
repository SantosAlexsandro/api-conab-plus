"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _WorkOrderWaitingQueueController = require('../controllers/WorkOrderWaitingQueueController'); var _WorkOrderWaitingQueueController2 = _interopRequireDefault(_WorkOrderWaitingQueueController);

const routes = new (0, _express.Router)();

// Listar todas as ordens na fila (com opção de filtrar por status)
routes.get('/', _WorkOrderWaitingQueueController2.default.index);

// Buscar detalhes de uma ordem por ID
//routes.get('/id/:id', WorkOrderWaitingQueueController.show);

// Buscar por número da ordem
//routes.get('/order/:orderNumber', WorkOrderWaitingQueueController.findByOrderNumber);

// Buscar por ID da requisição da URA
//routes.get('/ura/:uraRequestId', WorkOrderWaitingQueueController.findByUraRequestId);

// Retornar as opções de status para uso no frontend
//routes.get('/options', WorkOrderWaitingQueueController.getStatusOptions);

exports. default = routes;
