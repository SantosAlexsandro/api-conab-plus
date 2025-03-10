"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// AuthController.js

var _AuthServicejs = require('../services/AuthService.js'); var _AuthServicejs2 = _interopRequireDefault(_AuthServicejs);

class AuthController {

  async getByUserName(req, res) {
    try {

      const { UserName, Password } = req.body;

      // Validação básica dos campos
      if (!UserName || !Password) {
        return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
      }

      const data = await _AuthServicejs2.default.authenticateUser({ UserName, Password });
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

exports. default = new AuthController();
