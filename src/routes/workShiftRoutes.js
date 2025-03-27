import { Router } from 'express';
import workShiftController from '../controllers/WorkShiftController';
import loginRequired from '../middlewares/loginRequired';

const router = new Router();

router.get('/', loginRequired, workShiftController.index);
router.post('/', workShiftController.store);
router.get('/:id', loginRequired, workShiftController.show);
router.put('/:id', loginRequired, workShiftController.update);
//router.delete('/:id', loginRequired, workShiftController.delete);

export default router;
