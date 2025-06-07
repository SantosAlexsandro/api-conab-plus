"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _https = require('https'); var _https2 = _interopRequireDefault(_https);

class AddressService {
  constructor() {
    this.apiUrl = process.env.ERP_API_URL;
    this.token = process.env.ERP_TOKEN;

    // Instância configurada do Axios
    this.axiosInstance = _axios2.default.create({
      baseURL: `${this.apiUrl}/api`,
      timeout: 20000, // 10 segundos de timeout
      headers: {
        'Riosoft-Token': this.token,
        'Accept': 'application/json, text/plain, */*',
      }
    });
  }

  // Método para buscar uma endereço com o específico CEP
  async getByZipCode(zipcode) {
    console.log('zipcode', zipcode)
    try {
      const { data } = await this.axiosInstance.get(`Generic/RetrieveCep?filter={%22CodigoCep%22:%22${zipcode}%22}&order=&pageSize=10&pageIndex=1`);
      return data
    } catch (error) {
      this.handleError(error);
    }
  }

  // Método para lidar com erros de forma padronizada
  handleError(error) {
    if (error.response) {
      // Erro de resposta da API
      console.error('Erro na resposta da API:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // Nenhuma resposta foi recebida
      console.error('Nenhuma resposta da API foi recebida:', error.request);
    } else {
      // Erro ao configurar a requisição
      console.error('Erro ao configurar a requisição:', error.message);
    }

    throw new Error('Erro ao processar a requisição.');
  }
}

exports. default = new AddressService();
