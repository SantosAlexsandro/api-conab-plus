import express from 'express';
import CityController from '../controllers/CityController';

const router = express.Router();

router.post('/sync', CityController.syncCities); // Sincronizar cidades do ERP
router.get('/', CityController.getAllCities); // Buscar todas as cidades
router.get('/:ibgeCityCod', CityController.show);

export default router;
