import express from 'express'; // Atualizado para usar 'import' no lugar de 'require'
import TypeServOrdController from '../controllers/TypeServOrdController';

const router = express.Router();

router.get('/', TypeServOrdController.getAll);

export default router;
