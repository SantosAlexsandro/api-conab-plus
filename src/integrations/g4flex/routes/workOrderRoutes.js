import { Router } from 'express';
import workOrderController from '../controllers/WorkOrderController';
import authG4Flex from '../middlewares/authG4Flex';

const router = new Router();

router.get('/check-open', authG4Flex, workOrderController.checkWorkOrder);

router.post('/requests', authG4Flex, workOrderController.requestWorkOrder);

router.post('/close', authG4Flex, workOrderController.closeWorkOrder);

export default router;
