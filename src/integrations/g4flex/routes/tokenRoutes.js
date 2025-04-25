import { Router } from 'express';
import tokenController from '../controllers/TokenController';

const router = new Router();

// Rota para autenticação G4Flex
router.post('/', tokenController.authenticate);

export default router;
