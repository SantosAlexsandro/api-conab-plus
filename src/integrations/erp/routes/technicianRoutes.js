import { Router } from 'express';
import technicianController from '../controllers/TechnicianERPController';

const router = new Router();

// Usando função anônima como wrapper para preservar o contexto this
router.get('/active', (req, res, next) => technicianController.getActiveTechnicians(req, res, next));

export default router;
