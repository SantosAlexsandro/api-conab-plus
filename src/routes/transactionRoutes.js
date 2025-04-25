import { Router } from 'express';
import transactionController from '../controllers/TransactionController';

// import authUser from '../middlewares/authUser';

const router = new Router();

router.get('/', transactionController.index);
/*router.post('/', authUser, transactionController.store);
router.put('/:id', authUser, transactionController.update);
router.get('/:id', transactionController.show);
router.delete('/:id', authUser, transactionController.delete);*/

router.post('/', transactionController.store);
router.put('/:id', transactionController.update);
router.get('/:id', transactionController.show);
router.delete('/:id', transactionController.delete);

export default router;
