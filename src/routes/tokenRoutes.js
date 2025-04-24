import { Router } from 'express';
import tokenController from '../controllers/TokenController';

const router = new Router();

router.post('/', tokenController.store);

router.post('/g4flex', tokenController.storeG4Flex);

export default router;
