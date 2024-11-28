import express from 'express'; // Atualizado para usar 'import' no lugar de 'require'
import StreetTypeController from '../controllers/StreetTypeController'; // Certifique-se de adicionar a extensão '.js'

const router = express.Router();

router.get('/', StreetTypeController.getAll);
router.get('/cities/:id', StreetTypeController.getById);

export default router;
