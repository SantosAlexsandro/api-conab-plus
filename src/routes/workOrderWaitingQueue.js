import { Router } from 'express';
import WorkOrderWaitingQueueController from '../controllers/WorkOrderWaitingQueueController';
import authUser from '../middlewares/authUser';
import checkPermission from '../middlewares/checkPermission';

const routes = new Router();

// Middleware de autenticação aplicado a todas as rotas
routes.use(authUser);

// Listar todas as ordens na fila (com opção de filtrar por status)
routes.get('/', checkPermission('workorder_queue.view'), WorkOrderWaitingQueueController.index);

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

export default routes;
