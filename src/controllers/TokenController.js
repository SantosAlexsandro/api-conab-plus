// src/controllers/TokenController.js

import jwt from 'jsonwebtoken';
import UserSession from '../models/UserSession';
import bcrypt from 'bcryptjs';

class TokenController {
  async store(req, res) {
    const { username = '', password = '' } = req.body;

    if (!username || !password) {
      return res.status(401).json({
        errors: ['Credenciais inválidas'],
      });
    }

    const userSession = await UserSession.findOne({
      where: {
        userName: username
      }
    });

    if (!userSession) {
      return res.status(401).json({
        errors: ['Usuário não existe'],
      });
    }

    // Verificando a senha
    const passwordMatch = await bcrypt.compare(password, userSession.encryptedPassword);
    if (!passwordMatch) {
      return res.status(401).json({
        errors: ['Senha inválida'],
      });
    }

    const { id } = userSession;
    const token = jwt.sign(
      {
        id,
        userName: username,
        type: 'user'
      },
      process.env.JWT_TOKEN_SECRET,
      {
        expiresIn: process.env.TOKEN_EXPIRATION,
      }
    );

    return res.status(200).json({
      token,
      user: {
        nome: username,
        id,
        userName: username
      }
    });
  }
}

export default new TokenController();
