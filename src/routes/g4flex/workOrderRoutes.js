import { Router } from 'express';
import workOrderController from '../../controllers/g4flex/WorkOrderController';

const router = new Router();

// Route to check immediate work orders
router.get('/check', workOrderController.checkWorkOrder);

export default router;
