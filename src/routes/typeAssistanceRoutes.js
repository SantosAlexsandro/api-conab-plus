import express from 'express'; // Atualizado para usar 'import' no lugar de 'require'
import TypeAssistanceController from '../controllers/TypeAssistanceController';

const router = express.Router();

router.get('/', TypeAssistanceController.getAll);

export default router;
