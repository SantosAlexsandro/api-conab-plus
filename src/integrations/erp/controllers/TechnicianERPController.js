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
      console.error('[TechnicianERPController] Erro ao buscar técnicos:', error);
      next(error);
    }
  }
}

export default new TechnicianERPController();
