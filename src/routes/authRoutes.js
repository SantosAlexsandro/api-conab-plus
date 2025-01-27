// authRoutes.js

import express from 'express';
import AuthController from '../controllers/AuthController.js';

const router = express.Router();

router.post('/login', AuthController.getByUserName);

export default router;
