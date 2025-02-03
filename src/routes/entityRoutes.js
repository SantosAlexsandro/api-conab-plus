import { Router } from 'express';
import entityController from '../controllers/EntityController';
import loginRequired from '../middlewares/loginRequired';
import authMiddleware from '../middlewares/authMiddleware'

const router = new Router();

router.get('/', authMiddleware, entityController.getAll);
router.get('/:id', authMiddleware, entityController.show);
router.post('/', authMiddleware, entityController.create);
router.post('/edit', authMiddleware, entityController.update);
//router.delete('/', loginRequired, entityController.delete);

export default router;
