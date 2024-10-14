"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _CategoryServicejs = require('../services/CategoryService.js'); var _CategoryServicejs2 = _interopRequireDefault(_CategoryServicejs); // Atualize para usar 'import' com a extensão '.js'

class CategoryController {
  async getAll(req, res) {
    try {
      const { page = 1, filter = "" } = req.query;
      const { data } = await _CategoryServicejs2.default.getAll(page, filter);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await _CategoryServicejs2.default.getById(id);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

exports. default = new CategoryController(); // Substitui 'module.exports' por 'export default'
