import { Router } from 'express';
import technicianController from '../controllers/TechnicianERPController';
import loginRequired from '../../../middlewares/loginRequired';

const router = new Router();

router.get('/active', loginRequired, technicianController.getActiveTechnicians);

export default router;
