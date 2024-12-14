"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _jsonwebtoken = require('jsonwebtoken'); var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);
// import Entity from '../models/Entity';

class TokenController {
  async store(req, res) {
    const { email = '', password = '' } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        errors: ['Credenciais inválidas'],
      });
    }

    const user = await Entity.findOne({ where: { entity_email: email } });
    //console.log('log', user)

    if (!user) {
      return res.status(401).json({
        errors: ['Usuário não existe.'],
      });
    }
    if (!(await user.passwordIsValid(password))) {
      return res.status(401).json({
        errors: ['Senha inválida.'],
      });
    }

    const { id } = user;
    const token = _jsonwebtoken2.default.sign({ id, entity_email: email }, process.env.TOKEN_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRATION,
    });

    return res.status(200).json({ token, user: { nome: user.entity_first_name, id, entity_email: email } });
  }
}

exports. default = new TokenController();
