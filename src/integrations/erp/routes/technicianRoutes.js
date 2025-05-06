import { Router } from 'express';
import technicianController from '../controllers/TechnicianERPController';

const router = new Router();

router.get('/active', technicianController.getActiveTechnicians);

export default router;
