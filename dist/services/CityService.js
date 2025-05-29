"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _City = require('../models/City'); var _City2 = _interopRequireDefault(_City);

class CitiesService {
  constructor() {
    this.apiUrl = "https://erpteste.conab.com.br:7211/api/Cidade";
    this.token =
      "fwqSxis3uU79zWrAxDMAhvtLCMLlyrjQZ44veS2MoTSppX9k4xFJURiEt+UQwpEqFLV77fhb+35l0hVovHB/am51s0ieQvhGCh7FZ2IEnOpdQAHZlltOxVO19iawFO9r8s/3ynyM4BjsRhSq/gJF8mF1nszLuNMwuxKZ74T7eXlMLjpxjmkmX4SxdIa6PlMXgC/PwPRTisBm1Dz7/1KSVpmgokToGoVV/91pVS8DNAXTSI9eR91xccZkOqyVjzDUlO7sj9vRlz9owJ6JUULmt+utMcnDI/gM9PUyCPUSSFJn0sFLmTbenEQnLQJLNf53dxqE+NmuXlB9GDPbnkPeCAcsfBq2CXnqRvPfKy1zBR8HpTSD120NSS2R6ccQkT6kTya1DIzASi3D6/ZgE69cJyXNcwl1nJhhbbv1znxU22AnX4plGMi3kvbv7Ten+QsEKqNDvvqpYCtbsAdanIAMVkkGyQDscZ92TIIrpZ1KHSM=";

    // Instância configurada do Axios
    this.axiosInstance = _axios2.default.create({
      baseURL: this.apiUrl,
      headers: {
        "Riosoft-Token": this.token,
        Accept: "application/json, text/plain, */*",
      },
    });
  }

  // Método para buscar todas as cidades
  async fetchCitiesFromERP(
    page = 1,
    filter = "( !ISNULL(CodigoMunicipioIBGE) )"
  ) {
    const pageSize = 25000;
    const url = `/RetrievePage?filter=${filter}&order&pageSize=${pageSize}&pageIndex=${page}`;

    try {
      const { data } = await this.axiosInstance.get(url);

      if (!data || !Array.isArray(data)) {
        throw new Error("Resposta inesperada da API.");
      }

      const seenIds = new Set(); // Criado um Set vazio para rastrear IDs únicos.
      console.log("data", data.length);
      const uniqueCities = data.filter((item) => {
        if (
          seenIds.has(item.CodigoMunicipioIBGE) ||
          item.CodigoMunicipioIBGE === null
        ) {
          return false; // Se o ID já existe ou está vazio no Set, este item é descartado (não incluído no array final).
        }
        seenIds.add(item.CodigoMunicipioIBGE); // Caso contrário, adicionamos o ID ao Set.
        return true; // Mantemos este item no array final.
      });

      // Mapeamento para limpar os campos
      const cleanedCities = uniqueCities.map((city) => ({
        city_cod: city.Codigo,
        full_name: city.NomeCompleto,
        acronym_federal_unit: city.SiglaUnidFederacao,
        ibge_city_cod: city.CodigoMunicipioIBGE,
      }));

      console.log("cleanedCities", cleanedCities.length);

      return {
        data: cleanedCities,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async storeCities() {
    try {
      console.log("Iniciando a sincronização de cidades...");
      const { data: cities } = await this.fetchCitiesFromERP();

      if (!cities || cities.length === 0) {
        console.log("Nenhuma cidade encontrada para sincronizar.");
        return;
      }

      console.log(`Total de cidades a serem armazenadas: ${cities.length}`);

      // Indica quais campos serão atualizados caso um registro duplicado seja encontrado.
      await _City2.default.bulkCreate(
        cities,
        {
          updateOnDuplicate: ["city_cod", "full_name", "acronym_federal_unit"], // Atualiza caso já exista
        } // Ignora registros duplicados
      );

      console.log("Sincronização concluída com sucesso.");
    } catch (error) {
      console.error("Erro ao armazenar cidades:", error.message);
      throw new Error("Erro ao armazenar cidades: " + error.message);
    }
  }

  async getAllCities() {
    try {
      const cities = await _City2.default.findAll({
        attributes: ["city_cod", "full_name", "acronym_federal_unit"],
        order: [["full_name", "ASC"]],
      });

      return cities;
    } catch (e) {
      console.error("Erro ao buscar todas as cidades:", error.message);
      throw new Error("Erro ao buscar cidades: " + error.message);
    }
  }

  async getCityByErpCode(erpCode) {
    const city = await _City2.default.findOne({
      where: { city_cod: erpCode },
    });
    return city;
  }

  handleError(error) {
    if (error.response) {
      // Erro de resposta da API
      console.error("Erro na resposta da API:", error.response.data);
      console.error("Status HTTP:", error.response.status);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      // Nenhuma resposta da API foi recebida
      console.error("Nenhuma resposta da API foi recebida:");
      console.error("Configuração da requisição:", error.config);
    } else {
      // Erro ao configurar a requisição
      console.error("Erro ao configurar a requisição:", error.message);
    }
    throw error; // Propaga o erro para o chamador
  }
}

exports. default = new CitiesService();
