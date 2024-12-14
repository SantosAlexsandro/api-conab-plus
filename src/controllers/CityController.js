import CityService from "../services/CityService"; // Atualize para usar 'import' com a extensão '.js'

class CityController {
  async syncCities(req, res) {
    try {
      await CityService.storeCities();
      res.status(200).json({ message: "Cidades sincronizadas com sucesso." });
    } catch (error) {
      res.status(500).json({ error: "Erro ao sincronizar cidades." });
    }
  }

  async getAllCities(req, res) {
    try {
      console.log("Buscando todas as cidades...");
      const cities = await CityService.getAllCities();
      console.log(`Total de cidades encontradas: ${cities.length}`);
      res.status(200).json(cities);
    } catch (err) {
      console.error("Erro ao buscar cidades:", err.message);
      res.status(500).json({ error: err.message });
    }
  }
}

export default new CityController(); // Substitui 'module.exports' por 'export default'
