// authRoutes.js

// Para autenticação de usuários, não é necessário passar o token no header, apenas o username e password.

import express from 'express';
import AuthController from '../controllers/AuthController.js';

const router = express.Router();

router.post('/login', AuthController.getByUserName);
router.post('/user', AuthController.login);

export default router;
