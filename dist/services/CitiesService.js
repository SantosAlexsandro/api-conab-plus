"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _https = require('https'); var _https2 = _interopRequireDefault(_https);

class CitiesService {
  constructor() {
    //this.apiUrl = 'https://erpteste.conab.com.br:7211/api/Cidade';
    this.apiUrl = "https://servicodados.ibge.gov.br/api/v1";
    //this.token = 'fwqSxis3uU79zWrAxDMAhvtLCMLlyrjQZ44veS2MoTSppX9k4xFJURiEt+UQwpEqFLV77fhb+35l0hVovHB/am51s0ieQvhGCh7FZ2IEnOpdQAHZlltOxVO19iawFO9r8s/3ynyM4BjsRhSq/gJF8mF1nszLuNMwuxKZ74T7eXlMLjpxjmkmX4SxdIa6PlMXgC/PwPRTisBm1Dz7/1KSVpmgokToGoVV/91pVS8DNAXTSI9eR91xccZkOqyVjzDUlO7sj9vRlz9owJ6JUULmt+utMcnDI/gM9PUyCPUSSFJn0sFLmTbenEQnLQJLNf53dxqE+NmuXlB9GDPbnkPeCAcsfBq2CXnqRvPfKy1zBR8HpTSD120NSS2R6ccQkT6kTya1DIzASi3D6/ZgE69cJyXNcwl1nJhhbbv1znxU22AnX4plGMi3kvbv7Ten+QsEKqNDvvqpYCtbsAdanIAMVkkGyQDscZ92TIIrpZ1KHSM=';

    // Instância configurada do Axios
    this.axiosInstance = _axios2.default.create({
      baseURL: this.apiUrl,
      //timeout: 20000, // 10 segundos de timeout
      headers: {
        "Riosoft-Token": this.token,
        Accept: "application/json, text/plain, */*",
      },
    });
  }

  // Método para buscar todas as regiões
  async getAll(page = 1, filter = "") {
    // const pageSize = 6000;
    // const url = `/RetrievePage?filter=${filter}&order&pageSize=${pageSize}&pageIndex=1`;
    const url = "/localidades/municipios";

    try {
      const { data } = await this.axiosInstance.get(url);
      // console.log(data)
      const transformedData = data.slice(0, 874).map((city) => ({
        Codigo: city.id,
        Nome: city.nome.toUpperCase(),
        SiglaUnidFederacao: city.microrregiao.mesorregiao.UF.sigla,
      }));
      // console.log(transformedData)

      return {
        data: transformedData,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Método para buscar uma região específica por ID
  async getById(id) {
    try {
      const { data } = await this.axiosInstance.get(`/${id}`);
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Método para lidar com erros de forma padronizada
  handleError(error) {
    if (error.response) {
      // Erro de resposta da API
      console.error("Erro na resposta da API:", error.response.data);
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      // Nenhuma resposta foi recebida
      console.error("Nenhuma resposta da API foi recebida:", error.request);
    } else {
      // Erro ao configurar a requisição
      console.error("Erro ao configurar a requisição:", error.message);
    }

    throw new Error("Erro ao processar a requisição.");
  }
}

exports. default = new CitiesService();
