import { Router } from 'express';
import transactionController from '../controllers/TransactionController';

// import authMiddleware from '../middlewares/authMiddleware';

const router = new Router();

router.get('/', transactionController.index);
/*router.post('/', authMiddleware, transactionController.store);
router.put('/:id', authMiddleware, transactionController.update);
router.get('/:id', transactionController.show);
router.delete('/:id', authMiddleware, transactionController.delete);*/

router.post('/', transactionController.store);
router.put('/:id', transactionController.update);
router.get('/:id', transactionController.show);
router.delete('/:id', transactionController.delete);

export default router;
