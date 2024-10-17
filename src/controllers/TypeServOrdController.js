import TypeServOrdService from '../services/TypeServOrdService'; // Atualize para usar 'import' com a extensão '.js'

class TypeServOrdController {
  async getAll(req, res) {
    try {
      const { page = 1, filter = "" } = req.query;
      const { data } = await TypeServOrdService.getAll(page, filter);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new TypeServOrdController();
