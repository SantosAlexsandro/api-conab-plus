import { Router } from 'express';
import itemController from '../controllers/ItemController';
import authUser from '../middlewares/authUser';

const router = new Router();

router.get('/', itemController.index);
router.post('/:id', authUser, itemController.store);
router.put('/:id', authUser, itemController.update);
router.get('/:id', itemController.show);
router.delete('/:id', authUser, itemController.delete);

export default router;
