"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _CitiesService = require('../services/CitiesService'); var _CitiesService2 = _interopRequireDefault(_CitiesService); // Atualize para usar 'import' com a extensão '.js'

class CitiesController {
  async getAll(req, res) {
    try {
      const { page = 1, filter = "" } = req.query;
      const { data } = await _CitiesService2.default.getAll(page, filter);
      console.log(data.length)

      if (!data || data.length === 0) {
        return res.status(404).json({ message: "No cities found" });
      }

      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await _CitiesService2.default.getById(id);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

exports. default = new CitiesController(); // Substitui 'module.exports' por 'export default'
