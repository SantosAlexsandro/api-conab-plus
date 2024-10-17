import express from 'express'; // Atualizado para usar 'import' no lugar de 'require'
import ProductController from '../controllers/ProductController';

const router = express.Router();

router.get('/', ProductController.getAll);

export default router;
