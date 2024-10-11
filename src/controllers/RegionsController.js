const RegionsService = require('../services/RegionsService');

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

module.exports = new RegionsController();
