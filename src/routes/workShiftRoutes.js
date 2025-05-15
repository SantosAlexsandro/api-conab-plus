import { Router } from 'express';
import workShiftController from '../controllers/WorkShiftController';
import { WorkShiftValidator } from '../validators/WorkShiftValidator';
import authUser from '../middlewares/authUser';
import validation from '../middlewares/validation';
import checkPermission from '../middlewares/checkPermission';

const router = new Router();

// Rotas específicas (devem vir antes das genéricas)
router.get('/active', authUser, checkPermission('workshift.view'), workShiftController.getActiveShifts);
router.get('/user/:userCode', authUser, checkPermission('workshift.view'), WorkShiftValidator.validateUserCode(), validation, workShiftController.getUserShifts);
router.get('/date-range', authUser, checkPermission('workshift.view'), WorkShiftValidator.validateDateRange(), validation, workShiftController.getShiftsByDateRange);
router.post('/check-overlap', authUser, checkPermission('workshift.view'), WorkShiftValidator.validateOverlapCheck(), validation, workShiftController.checkOverlap);

// Rotas básicas CRUD
router.get('/', authUser, checkPermission('shifts.view'), workShiftController.index);
router.post('/', authUser, checkPermission('shifts.create'), WorkShiftValidator.validateStore(), validation, workShiftController.store);
router.get('/:id', authUser, checkPermission('shifts.view'), WorkShiftValidator.validateId(), validation, workShiftController.show);
router.put('/:id', authUser, checkPermission('shifts.edit'), WorkShiftValidator.validateUpdate(), validation, workShiftController.update);
router.delete('/:id', authUser, checkPermission('shifts.delete'), WorkShiftValidator.validateId(), validation, workShiftController.delete);

export default router;
