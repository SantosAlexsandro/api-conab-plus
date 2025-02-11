"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _CityService = require('../services/CityService'); var _CityService2 = _interopRequireDefault(_CityService); // Atualize para usar 'import' com a extensão '.js'
var _City = require('../models/City'); var _City2 = _interopRequireDefault(_City);

class CityController {
  async syncCities(req, res) {
    try {
      await _CityService2.default.storeCities();
      res.status(200).json({ message: "Cidades sincronizadas com sucesso." });
    } catch (error) {
      res.status(500).json({ error: "Erro ao sincronizar cidades." });
    }
  }

  async getAllCities(req, res) {
    try {
      console.log("Buscando todas as cidades...");
      const cities = await _CityService2.default.getAllCities();
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
      const city = await _City2.default.findOne({
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

exports. default = new CityController(); // Substitui 'module.exports' por 'export default'
