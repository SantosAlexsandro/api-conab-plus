import RegionsService from '../services/RegionsService.js'; // Atualize para usar 'import' com a extensão '.js'

class RegionsController {
  async getAll(req, res) {
    try {
      const { page = 1, filter = '' } = req.query;
      const data = await RegionsService.getAll(page, filter);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await RegionsService.getById(id);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new RegionsController(); // Substitui 'module.exports' por 'export default'
