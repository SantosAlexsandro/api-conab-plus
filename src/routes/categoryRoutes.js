import express from 'express'; // Atualizado para usar 'import' no lugar de 'require'
import CategoryController from '../controllers/CategoryController.js'; // Certifique-se de adicionar a extensão '.js'

const router = express.Router();

router.get('/Categoria', CategoryController.getAll);
router.get('/Categoria/:id', CategoryController.getById);

export default router;
