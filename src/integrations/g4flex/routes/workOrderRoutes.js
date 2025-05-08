import { Router } from 'express';
import workOrderController from '../controllers/WorkOrderController';
import authG4Flex from '../middlewares/authG4Flex';
import preventDuplicateURARequest from '../middlewares/preventDuplicateURARequest';

const router = new Router();

router.get('/open', authG4Flex, workOrderController.getOpenOrders);

router.post('/requests', authG4Flex, preventDuplicateURARequest, workOrderController.requestWorkOrder);

router.post('/close', authG4Flex, preventDuplicateURARequest, workOrderController.closeWorkOrder);

router.post('/cancel', authG4Flex, preventDuplicateURARequest, workOrderController.cancelWorkOrder);

export default router;
