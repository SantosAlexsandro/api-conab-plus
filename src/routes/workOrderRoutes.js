import { Router } from 'express';
import workOrderController from '../controllers/WorkOrderController';
import authUser from '../middlewares/authUser';

const router = new Router();

router.get('/', workOrderController.getAll);
router.get('/tech', workOrderController.getAllbyTech);
router.post('/', workOrderController.create);
router.post('/updateStage', workOrderController.updateOrderStage);
router.get('/nextStages', workOrderController.getNextStages);
//router.get('/:id', workOrderController.show);
//router.put('/', authUser, workOrderController.update);
//router.delete('/', authUser, workOrderController.delete);

export default router;
