import { Router } from 'express';
import contractController from '../controllers/ContractController';
import authG4Flex from '../middlewares/authG4Flex';

const router = Router();

router.get('/check-active', authG4Flex, contractController.checkContract);

export default router;
