import BaseG4FlexService from './BaseG4FlexService';
import logEvent from '../../../utils/logEvent';

class TechnicianService extends BaseG4FlexService {
  constructor() {
    super();
  }

  /**
   * Busca um técnico disponível no G4Flex
   * @returns {Promise<Object|null>} Técnico disponível ou null se não houver
   */
  async getAvailableTechnician() {
    try {
      // Buscar técnicos disponíveis na API do G4Flex
      const response = await this.axiosInstance.get('/api/Tecnicos/RetrievePage?filter=Disponivel=true&pageSize=5');

      const tecnicos = response.data;
      console.log(`[G4Flex] Encontrados ${tecnicos.length} técnicos disponíveis`);

      // Retorna o primeiro técnico disponível ou null
      return tecnicos.length > 0 ? tecnicos[0] : null;
    } catch (error) {
      this.handleError(error);
      throw new Error(`Erro ao buscar técnicos disponíveis: ${error.message}`);
    }
  }

  /**
   * Atribui um técnico a uma ordem de serviço
   * @param {string} orderId ID da ordem de serviço
   * @param {string} technicianId ID do técnico
   * @returns {Promise<boolean>} True se atribuído com sucesso
   */
  async assignTechnician(orderId, technicianId) {
    try {
      // Chamada à API do G4Flex para atribuir o técnico
      const response = await this.axiosInstance.post('/api/OrdServ/AtribuirTecnico', {
        numeroOrdemServico: orderId,
        codigoTecnico: technicianId
      });

      const success = response.status === 200;
      console.log(`[G4Flex] ${success ? 'Sucesso' : 'Falha'} ao atribuir técnico ${technicianId} à ordem ${orderId}`);

      return success;
    } catch (error) {
      this.handleError(error);
      throw new Error(`Erro ao atribuir técnico à ordem: ${error.message}`);
    }
  }
}

export default new TechnicianService();
