import { Router } from 'express';
import contractController from '../controllers/ContractController';
import authMiddleware from '../../../middlewares/authMiddleware';

const router = Router();


router.get('/check-active', authMiddleware, contractController.checkContract);

export default router;
