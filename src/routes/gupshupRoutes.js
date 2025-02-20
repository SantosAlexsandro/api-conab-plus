// authRoutes.js

import express from 'express';
import GupshupController from '../controllers/GupshupController';

const router = express.Router();

router.post('/webhook', GupshupController.webhook);

export default router;
