import { Router } from 'express';
import workOrderController from '../controllers/WorkOrderController';
import authMiddleware from '../../../middlewares/authMiddleware';

const router = new Router();

router.get('/check-open', authMiddleware, workOrderController.checkWorkOrder);

router.post('/requests', authMiddleware, workOrderController.requestWorkOrder);

router.post('/close', authMiddleware, workOrderController.closeWorkOrder);

export default router;
