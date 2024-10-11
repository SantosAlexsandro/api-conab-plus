const axios = require('axios');

class RegionsService {
  // Método para buscar todas as regiões
  async getAll(page = 1, filter = '') {
    // const url = `https://erpteste.conab.com.br/api/Regiao/RetrievePage?filter=${filter}&pageIndex=${page}&pageSize=10`;
    const url = `https://erpteste.conab.com.br/api/Regiao/RetrievePage?filter&order&pageSize=8000&pageIndex=1`;

    try {
      axios.defaults.headers.common['Riosoft-Token'] = 'fwqSxis3uU79zWrAxDMAhvtLCMLlyrjQZ44veS2MoTSppX9k4xFJURiEt+UQwpEqFLV77fhb+35l0hVovHB/am51s0ieQvhGCh7FZ2IEnOpdQAHZlltOxVO19iawFO9r8s/3ynyM4BjsRhSq/gJF8mF1nszLuNMwuxKZ74T7eXlMLjpxjmkmX4SxdIa6PlMXgC/PwPRTisBm1Dz7/1KSVpmgokToGoVV/91pVS8DNAXTSI9eR91xccZkOqyVjzDUlO7sj9vRlz9owJ6JUULmt+utMcnDI/gM9PUyCPUSSFJn0sFLmTbenEQnLQJLNf53dxqE+NmuXlB9GDPbnkPeCAcsfBq2CXnqRvPfKy1zBR8HpTSD120NSS2R6ccQkT6kTya1DIzASi3D6/ZgE69cJyXNcwl1nJhhbbv1znxU22AnX4plGMi3kvbv7Ten+QsEKqNDvvqpYCtbsAdanIAMVkkGyQDscZ92TIIrpZ1KHSM=';
      const { data, headers } = await axios.get(url);
      return {
        data,
        totalCount: headers['x-total-count'] || 10,
      };
    } catch (error) {
      console.error('Erro ao buscar as regiões:', error.message);
      throw new Error('Erro ao buscar regiões.');
    }
  }

  // Método para buscar uma região específica por ID
  async getById(id) {
    try {
      const { data } = await axios.get(`https://api.riosoft.com/api/Regiao/${id}`);
      return data;
    } catch (error) {
      console.error('Erro ao buscar a região:', error.message);
      throw new Error('Erro ao buscar a região.');
    }
  }
}

module.exports = new RegionsService();
