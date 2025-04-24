import { Router } from 'express';
import itemController from '../controllers/ItemController';
import authMiddleware from '../middlewares/authMiddleware';

const router = new Router();

router.get('/', itemController.index);
router.post('/:id', authMiddleware, itemController.store);
router.put('/:id', authMiddleware, itemController.update);
router.get('/:id', itemController.show);
router.delete('/:id', authMiddleware, itemController.delete);

export default router;
