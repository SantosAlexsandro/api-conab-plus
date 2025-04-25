// AuthController.js

import AuthService from "../services/AuthService.js";

class AuthController {

  async getByUserName(req, res) {
    try {
      const { UserName, Password } = req.body;

      // Validação básica dos campos
      if (!UserName || !Password) {
        return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
      }

      const data = await AuthService.authenticateUser({ UserName, Password });
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;

      // Validação básica dos campos
      if (!username || !password) {
        return res.status(400).json({ success: false, errors: ['Nome de usuário e senha são obrigatórios.'] });
      }

      const data = await AuthService.authenticateUser({ UserName: username, Password: password });
      return res.json({ success: true, ...data });
    } catch (error) {
      return res.status(500).json({ success: false, errors: [error.message] });
    }
  }
}

export default new AuthController();
