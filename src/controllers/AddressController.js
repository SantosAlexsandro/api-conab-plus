import AddressService from '../services/AddressService'; // Atualize para usar 'import' com a extensão '.js'

class AddressController {
  async getByZipCode(req, res) {
    try {
      const { zipcode } = req.params;
      const data = await AddressService.getByZipCode(zipcode);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new AddressController(); // Substitui 'module.exports' por 'export default'
