import CityService from "../services/CityService"; // Atualize para usar 'import' com a extensão '.js'
import City from '../models/City';

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


  async show(req, res) {
    try {
      const { ibgeCityCod } = req.params;
      console.log('ibgeCityCod:', ibgeCityCod);

      if (!ibgeCityCod) {
        return res.status(400).json({
          errors: ['Faltando ID'],
        });
      }

      // Busca a cidade pelo código IBGE
      const city = await City.findOne({
        where: { ibge_city_cod: ibgeCityCod },
      });

      if (!city) {
        return res.status(404).json({
          errors: ['Cidade não encontrada.'],
        });
      }

      return res.json(city);
    } catch (e) {
      console.error('Erro ao buscar cidade:', e);

      return res.status(500).json({
        errors: e.errors ? e.errors.map((err) => err.message) : ['Erro interno do servidor'],
      });
    }
  }


}

export default new CityController(); // Substitui 'module.exports' por 'export default'
