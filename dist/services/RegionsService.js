"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

class RegionsService {
  // Método para buscar todas as regiões
  async getAll(page = 1, filter = '') {
    const url = `https://erpteste.conab.com.br/api/Regiao/RetrievePage?filter&order&pageSize=8000&pageIndex=1`;

    try {
      _axios2.default.defaults.headers.common['Riosoft-Token'] = 'fwqSxis3uU79zWrAxDMAhvtLCMLlyrjQZ44veS2MoTSppX9k4xFJURiEt+UQwpEqFLV77fhb+35l0hVovHB/am51s0ieQvhGCh7FZ2IEnOpdQAHZlltOxVO19iawFO9r8s/3ynyM4BjsRhSq/gJF8mF1nszLuNMwuxKZ74T7eXlMLjpxjmkmX4SxdIa6PlMXgC/PwPRTisBm1Dz7/1KSVpmgokToGoVV/91pVS8DNAXTSI9eR91xccZkOqyVjzDUlO7sj9vRlz9owJ6JUULmt+utMcnDI/gM9PUyCPUSSFJn0sFLmTbenEQnLQJLNf53dxqE+NmuXlB9GDPbnkPeCAcsfBq2CXnqRvPfKy1zBR8HpTSD120NSS2R6ccQkT6kTya1DIzASi3D6/ZgE69cJyXNcwl1nJhhbbv1znxU22AnX4plGMi3kvbv7Ten+QsEKqNDvvqpYCtbsAdanIAMVkkGyQDscZ92TIIrpZ1KHSM=';

      const { data, headers } = await _axios2.default.get(url);
      return {
        data,
        totalCount: headers['x-total-count'] || 10,
      };
    } catch (error) {
      if (error.response) {
        // Erro de resposta da API
        console.error('Erro na resposta da API:', error.response.data);  // Corpo da resposta
        console.error('Status:', error.response.status);  // Código de status HTTP
        console.error('Headers:', error.response.headers);  // Cabeçalhos da resposta
      } else if (error.request) {
        // Nenhuma resposta foi recebida
        console.error('Nenhuma resposta da API foi recebida:', error.request);
      } else {
        // Erro ao configurar a requisição
        console.error('Erro ao configurar a requisição:', error.message);
      }
      throw new Error('Erro ao buscar regiões.');
    }
  }

  // Método para buscar uma região específica por ID
  async getById(id) {
    try {
      const { data } = await _axios2.default.get(`https://api.riosoft.com/api/Regiao/${id}`);
      return data;
    } catch (error) {
      if (error.response) {
        console.error('Erro na resposta da API:', error.response.data);
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        console.error('Nenhuma resposta da API foi recebida:', error.request);
      } else {
        console.error('Erro ao configurar a requisição:', error.message);
      }
      throw new Error('Erro ao buscar a região.');
    }
  }
}

exports. default = new RegionsService();
