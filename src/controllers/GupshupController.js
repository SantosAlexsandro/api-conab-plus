// AuthController.js

import GupshupService from "../services/GupshupService";

class GupshupController {

  async webhook(req, res) {
    try {
      return res.json('ok');
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new GupshupController();
