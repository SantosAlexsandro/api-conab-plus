import { Router } from 'express';
import entityController from '../controllers/EntityController';
import authMiddleware from '../middlewares/authMiddleware'

const router = new Router();

router.get('/', authMiddleware, entityController.getAll);
router.get('/:id', authMiddleware, entityController.show);
router.post('/', authMiddleware, entityController.create);
router.post('/edit', authMiddleware, entityController.update);
router.post('/savePartialData', authMiddleware, entityController.savePartialData);
//router.delete('/', loginRequired, entityController.delete);

export default router;
