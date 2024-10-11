const express = require('express');
const RegioesController = require('../controllers/RegionsController');

const router = express.Router();

router.get('/regioes', RegioesController.getAll);
router.get('/regioes/:id', RegioesController.getById);

export default router;
