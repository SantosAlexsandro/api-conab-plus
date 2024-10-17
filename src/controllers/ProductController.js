import ProductService from '../services/ProductService'; // Atualize para usar 'import' com a extensão '.js'

class ProductController {
  async getAll(req, res) {
    try {
      const { page = 1, filter = "" } = req.query;
      const { data } = await ProductService.getAll(page, filter);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new ProductController();
