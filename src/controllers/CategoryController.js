import CategoryService from '../services/CategoryService.js'; // Atualize para usar 'import' com a extensão '.js'

class CategoryController {
  async getAll(req, res) {
    try {
      const { page = 1, filter = "" } = req.query;
      const { data } = await CategoryService.getAll(page, filter);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await CategoryService.getById(id);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new CategoryController(); // Substitui 'module.exports' por 'export default'
