import express from 'express'; // Atualizado para usar 'import' no lugar de 'require'
import AddressController from '../controllers/AddressController'; // Certifique-se de adicionar a extensão '.js'

const router = express.Router();

router.get('/address/:zipcode', AddressController.getByZipCode);

export default router;
