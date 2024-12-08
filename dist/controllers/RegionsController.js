"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _RegionsServicejs = require('../services/RegionsService.js'); var _RegionsServicejs2 = _interopRequireDefault(_RegionsServicejs); // Atualize para usar 'import' com a extensão '.js'

class RegionsController {
  async getAll(req, res) {
    try {
      const { page = 1, filter = "" } = req.query;
      const { data } = await _RegionsServicejs2.default.getAll(page, filter);
      res.set('Cache-Control', 'public, max-age=86400'); // Configura o cabeçalho
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await _RegionsServicejs2.default.getById(id);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

exports. default = new RegionsController(); // Substitui 'module.exports' por 'export default'
