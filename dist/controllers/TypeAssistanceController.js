"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _TypeAssistanceService = require('../services/TypeAssistanceService'); var _TypeAssistanceService2 = _interopRequireDefault(_TypeAssistanceService); // Atualize para usar 'import' com a extensão '.js'

class TypeAssistanceController {
  async getAll(req, res) {
    try {
      const response = await _TypeAssistanceService2.default.getAll();
      const { data } = response;
      return res.json( data );
    } catch (e) {
      return res.status(400).json({ errors: e.errors.map((err) => err.message) });
    }
  }
}

exports. default = new TypeAssistanceController();
