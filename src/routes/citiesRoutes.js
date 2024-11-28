import express from 'express'; // Atualizado para usar 'import' no lugar de 'require'
import CitiesController from '../controllers/CitiesController.js'; // Certifique-se de adicionar a extensão '.js'

const router = express.Router();

router.get('/', CitiesController.getAll);
router.get('/cities/:id', CitiesController.getById);

export default router;
