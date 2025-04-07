import { Router } from 'express';
import workOrderController from '../../controllers/g4flex/WorkOrderController';

const router = new Router();

router.get('/check-open', workOrderController.checkWorkOrder);

router.post('/requests', workOrderController.createWorkOrder);

router.post('/close', workOrderController.closeWorkOrder);

export default router;
