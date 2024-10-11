import express from 'express'; // Atualizado para usar 'import' no lugar de 'require'
import RegioesController from '../controllers/RegionsController.js'; // Certifique-se de adicionar a extensão '.js'

const router = express.Router();

router.get('/regioes', RegioesController.getAll);
router.get('/regioes/:id', RegioesController.getById);

export default router;
