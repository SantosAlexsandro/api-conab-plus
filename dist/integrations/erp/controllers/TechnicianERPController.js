"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _TechnicianERPService = require('../services/TechnicianERPService'); var _TechnicianERPService2 = _interopRequireDefault(_TechnicianERPService);

class TechnicianERPController {
  constructor() {
    this.technicianService = new (0, _TechnicianERPService2.default)();
  }


  async getActiveTechnicians(req, res, next) {
    try {
      const technicians = await this.technicianService.getActiveTechsFromEmployeeList();
      return res.json(technicians);
    } catch (error) {
      next(error);
    }
  }
}

exports. default = new TechnicianERPController();
