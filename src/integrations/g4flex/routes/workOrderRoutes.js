import { Router } from 'express';
import workOrderController from '../controllers/WorkOrderController';
import authG4Flex from '../middlewares/authG4Flex';

const router = new Router();

router.get('/open', authG4Flex, workOrderController.getOpenOrdersByCustomerId);

router.post('/requests', authG4Flex, workOrderController.requestWorkOrder);

router.post('/close', authG4Flex, workOrderController.closeWorkOrder);

// Nova rota para falhas da URA
router.post('/request-failures', workOrderController.handleRequestFailures);

export default router;
