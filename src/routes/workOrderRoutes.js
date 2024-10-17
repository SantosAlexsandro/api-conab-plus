import { Router } from 'express';
import workOrderController from '../controllers/WorkOrderController';
import loginRequired from '../middlewares/loginRequired';

const router = new Router();

router.get('/', workOrderController.getAll);
// router.get('/:id', entityController.show); // Lista usuário - Não deveria existir
router.post('/', workOrderController.create);
//router.put('/', loginRequired, entityController.update);
//router.delete('/', loginRequired, entityController.delete);

export default router;
