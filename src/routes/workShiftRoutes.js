import { Router } from 'express';
import workShiftController from '../controllers/WorkShiftController';
import { WorkShiftValidator } from '../validators/WorkShiftValidator';
import loginRequired from '../middlewares/loginRequired';
import validation from '../middlewares/validation';

const router = new Router();

// Rotas básicas CRUD
router.get('/', workShiftController.index);
router.post('/', WorkShiftValidator.validateStore(), validation, workShiftController.store);
router.get('/:id', WorkShiftValidator.validateId(), validation, workShiftController.show);
router.put('/:id', WorkShiftValidator.validateUpdate(), validation, workShiftController.update);
router.delete('/:id', WorkShiftValidator.validateId(), validation, workShiftController.delete);

// Rotas específicas
router.get('/active', workShiftController.getActiveShifts);
router.get('/user/:userCode', WorkShiftValidator.validateUserCode(), validation, workShiftController.getUserShifts);
router.get('/date-range', WorkShiftValidator.validateDateRange(), validation, workShiftController.getShiftsByDateRange);
router.post('/check-overlap', WorkShiftValidator.validateOverlapCheck(), validation, workShiftController.checkOverlap);

export default router;
