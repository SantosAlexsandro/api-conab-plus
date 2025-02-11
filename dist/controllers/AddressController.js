"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _AddressService = require('../services/AddressService'); var _AddressService2 = _interopRequireDefault(_AddressService); // Atualize para usar 'import' com a extensão '.js'

class AddressController {
  async getByZipCode(req, res) {
    try {
      const { zipcode } = req.params;
      const data = await _AddressService2.default.getByZipCode(zipcode);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

exports. default = new AddressController(); // Substitui 'module.exports' por 'export default'
