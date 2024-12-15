import { Router } from 'express';
import entityController from '../controllers/EntityController';
import loginRequired from '../middlewares/loginRequired';

const router = new Router();

router.get('/', entityController.getAll);
router.get('/:id', entityController.show);
router.post('/', entityController.create);
//router.put('/', loginRequired, entityController.update);
//router.delete('/', loginRequired, entityController.delete);

export default router;
