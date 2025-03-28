import { Router } from 'express';
import workOrderController from '../../controllers/g4flex/WorkOrderController';

const router = new Router();

// Rota para verificar ordens de serviço imediata
router.get('/verificar', workOrderController.verificarOrdem);

export default router;
