"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/controllers/TokenController.js

var _jsonwebtoken = require('jsonwebtoken'); var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);
var _UserSession = require('../models/UserSession'); var _UserSession2 = _interopRequireDefault(_UserSession);
var _bcryptjs = require('bcryptjs'); var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

class TokenController {
  async store(req, res) {
    const { username = '', password = '' } = req.body;

    if (!username || !password) {
      return res.status(401).json({
        errors: ['Credenciais inválidas'],
      });
    }

    const userSession = await _UserSession2.default.findOne({
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
    const passwordMatch = await _bcryptjs2.default.compare(password, userSession.encryptedPassword);
    if (!passwordMatch) {
      return res.status(401).json({
        errors: ['Senha inválida'],
      });
    }

    const { id } = userSession;
    const token = _jsonwebtoken2.default.sign(
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

exports. default = new TokenController();
