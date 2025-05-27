import { Router } from 'express';
import uraController from '../controllers/UraController';

const router = new Router();

// Rota para registrar falhas gerais da URA (endpoint público)
router.post('/failures', uraController.handleFailures);

export default router;
