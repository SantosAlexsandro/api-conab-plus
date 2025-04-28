import { Router } from 'express';
import WorkOrderWaitingQueueController from '../controllers/WorkOrderWaitingQueueController';

const routes = new Router();

// Listar todas as ordens na fila (com opção de filtrar por status)
routes.get('/', WorkOrderWaitingQueueController.index);

// Buscar detalhes de uma ordem por ID
//routes.get('/id/:id', WorkOrderWaitingQueueController.show);

// Buscar por número da ordem
//routes.get('/order/:orderNumber', WorkOrderWaitingQueueController.findByOrderNumber);

// Buscar por ID da requisição da URA
//routes.get('/ura/:uraRequestId', WorkOrderWaitingQueueController.findByUraRequestId);

// Retornar as opções de status para uso no frontend
//routes.get('/options', WorkOrderWaitingQueueController.getStatusOptions);

export default routes;
