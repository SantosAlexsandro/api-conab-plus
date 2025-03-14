import { Router } from 'express';
import workOrderPhotoController from '../controllers/WorkOrderPhotoController';
import loginRequired from '../middlewares/loginRequired';
import { uploadToMemory } from '../config/multerConfig'; // Importa as duas opções

const router = new Router();

router.post('/upload', uploadToMemory.single('photo'),workOrderPhotoController.uploadPhoto);

export default router;
