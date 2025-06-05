import { Router } from 'express';
import entityController from '../controllers/EntityController';
import authUser from '../middlewares/authUser';

const router = new Router();

router.get('/', authUser, entityController.getAll);
router.get('/search', authUser, entityController.getByFilter);
router.get('/:id', authUser, entityController.show);
router.post('/', authUser, entityController.create);
router.post('/edit', authUser, entityController.update);
router.post('/savePartialData', authUser, entityController.savePartialData);
//router.delete('/', authUser, entityController.delete);

export default router;
