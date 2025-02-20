"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// AuthController.js

var _GupshupService = require('../services/GupshupService'); var _GupshupService2 = _interopRequireDefault(_GupshupService);

class GupshupController {

  async webhook(req, res) {
    try {
      return res.json('ok');
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

exports. default = new GupshupController();
