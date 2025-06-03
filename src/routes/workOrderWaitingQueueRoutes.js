import { Router } from 'express';
import workOrderWaitingQueueController from '../controllers/WorkOrderWaitingQueueController';
import authUser from '../middlewares/authUser';
import checkPermission from '../middlewares/checkPermission';

const router = new Router();

// Middleware de autenticação para todas as rotas
console.log('🔍 [Routes] Aplicando middleware authUser nas rotas work-order-queue');
// router.use(authUser); TODO: Incluir no futuro

// Pausar atribuição de técnico para uma ordem específica
router.post('/:orderNumber/pause-technician-assignment', workOrderWaitingQueueController.pauseTechnicianAssignment);

// Retomar atribuição de técnico para uma ordem específica
router.post('/:orderNumber/resume-technician-assignment', workOrderWaitingQueueController.resumeTechnicianAssignment);

// Listar todas as ordens na fila (com opção de filtrar por status)
router.get('/', checkPermission('workorder_queue.view'), workOrderWaitingQueueController.index);

export default router;
