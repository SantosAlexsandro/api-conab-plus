import StreetTypeService from '../services/StreetTypeService'; // Atualize para usar 'import' com a extensão '.js'

class StreetTypeController {
  async getAll(req, res) {
    try {
      const { page = 1, filter = "" } = req.query;
      const { data } = await StreetTypeService.getAll(page, filter);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await StreetTypeService.getById(id);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new StreetTypeController(); // Substitui 'module.exports' por 'export default'
