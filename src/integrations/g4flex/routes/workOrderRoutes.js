import { Router } from 'express';
import workOrderController from '../controllers/WorkOrderController';

const router = new Router();

router.get('/check-open', workOrderController.checkWorkOrder);

router.post('/requests', workOrderController.requestWorkOrder);

router.post('/close', workOrderController.closeWorkOrder);

export default router;
