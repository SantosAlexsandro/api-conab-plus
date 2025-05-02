import TechnicianERPService from '../services/TechnicianERPService';

class TechnicianERPController {
  constructor() {
    this.technicianService = new TechnicianERPService();
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

export default new TechnicianERPController();
