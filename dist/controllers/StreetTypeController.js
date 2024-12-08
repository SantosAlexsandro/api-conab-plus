"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _StreetTypeService = require('../services/StreetTypeService'); var _StreetTypeService2 = _interopRequireDefault(_StreetTypeService); // Atualize para usar 'import' com a extensão '.js'

class StreetTypeController {
  async getAll(req, res) {
    try {
      const { page = 1, filter = "" } = req.query;
      const { data } = await _StreetTypeService2.default.getAll(page, filter);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await _StreetTypeService2.default.getById(id);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

exports. default = new StreetTypeController(); // Substitui 'module.exports' por 'export default'
