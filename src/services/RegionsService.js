import axios from 'axios';
import https from 'https';

class RegionsService {
  constructor() {
    this.apiUrl = 'https://erpteste.conab.com.br:7211/api/Regiao';
    this.token = 'fwqSxis3uU79zWrAxDMAhvtLCMLlyrjQZ44veS2MoTSppX9k4xFJURiEt+UQwpEqFLV77fhb+35l0hVovHB/am51s0ieQvhGCh7FZ2IEnOpdQAHZlltOxVO19iawFO9r8s/3ynyM4BjsRhSq/gJF8mF1nszLuNMwuxKZ74T7eXlMLjpxjmkmX4SxdIa6PlMXgC/PwPRTisBm1Dz7/1KSVpmgokToGoVV/91pVS8DNAXTSI9eR91xccZkOqyVjzDUlO7sj9vRlz9owJ6JUULmt+utMcnDI/gM9PUyCPUSSFJn0sFLmTbenEQnLQJLNf53dxqE+NmuXlB9GDPbnkPeCAcsfBq2CXnqRvPfKy1zBR8HpTSD120NSS2R6ccQkT6kTya1DIzASi3D6/ZgE69cJyXNcwl1nJhhbbv1znxU22AnX4plGMi3kvbv7Ten+QsEKqNDvvqpYCtbsAdanIAMVkkGyQDscZ92TIIrpZ1KHSM=';

    // Instância configurada do Axios
    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      timeout: 20000, // 10 segundos de timeout
      headers: {
        'Riosoft-Token': this.token,
        'Accept': 'application/json, text/plain, */*',
      }
    });
  }

  // Método para buscar todas as regiões
  async getAll(page = 1, filter = '') {
    const pageSize = 8000;
    const url = `/RetrievePage?filter=${filter}&order&pageSize=${pageSize}&pageIndex=1`;

    try {
      const { data, headers } = await this.axiosInstance.get(url);
      return {
        data,
        totalCount: headers['x-total-count'] || 10, // Fallback para 10 se o cabeçalho não existir
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

export default new RegionsService();
