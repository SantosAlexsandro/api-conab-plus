import TypeAssistanceService from '../services/TypeAssistanceService'; // Atualize para usar 'import' com a extensão '.js'

class TypeAssistanceController {
  async getAll(req, res) {
    try {
      const response = await TypeAssistanceService.getAll();
      const { data } = response;
      return res.json( data );
    } catch (e) {
      return res.status(400).json({ errors: e.errors.map((err) => err.message) });
    }
  }
}

export default new TypeAssistanceController();
