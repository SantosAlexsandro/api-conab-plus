"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _TypeServOrdService = require('../services/TypeServOrdService'); var _TypeServOrdService2 = _interopRequireDefault(_TypeServOrdService); // Atualize para usar 'import' com a extensão '.js'

class TypeServOrdController {
  async getAll(req, res) {
    try {
      const { page = 1, filter = "" } = req.query;
      const { data } = await _TypeServOrdService2.default.getAll(page, filter);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

exports. default = new TypeServOrdController();
