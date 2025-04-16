import BaseG4FlexService from './BaseG4FlexService';
import logEvent from '../../../utils/logEvent';
import WorkShift from '../../../models/WorkShift';
import { Op } from 'sequelize';

class TechnicianService extends BaseG4FlexService {
  constructor() {
    super();
  }

  async getAvailableTechnician() {
    try {
      // Buscar turnos ativos no momento atual
      const now = new Date();
      const activeShifts = await WorkShift.findAll({
        where: {
          status: 'ACTIVE',
          start_time: { [Op.lte]: now },
          end_time: { [Op.gte]: now },
        },
      });

      if (activeShifts.length === 0) {
        console.log('[TechnicianService] Nenhum turno ativo encontrado no momento');
        return null;
      }

      // Extrair códigos dos técnicos em turnos ativos
      const activeTechnicianCodes = activeShifts.map(shift => shift.user_code);
      console.log(`[TechnicianService] Técnicos em turno ativo: ${activeTechnicianCodes.join(', ')}`);

      /*
      // Buscar técnicos disponíveis no G4Flex
      const response = await this.axiosInstance.get('/api/Tecnicos/RetrievePage?filter=Disponivel=true&pageSize=20');
      const allAvailableTechnicians = response.data;

      if (!allAvailableTechnicians || allAvailableTechnicians.length === 0) {
        console.log('[TechnicianService] Nenhum técnico disponível no G4Flex');
        return null;
      }

      // Filtrar técnicos que estão disponíveis no G4Flex E em turno ativo
      const availableTechnicians = allAvailableTechnicians.filter(tech =>
        activeTechnicianCodes.includes(tech.Codigo)
      );
      console.log(`[TechnicianService] ${availableTechnicians.length} técnicos disponíveis e em turno ativo`);

      // Retorna o primeiro técnico disponível ou null
      if (availableTechnicians.length > 0) {
        const selectedTechnician = availableTechnicians[0];
        return {
          id: selectedTechnician.Codigo,
          nome: selectedTechnician.Nome,
          disponivel: true
        };
      }  */

      if (activeTechnicianCodes.length > 0) {
        const selectedTechnician = activeTechnicianCodes[0];
        return {
          id: selectedTechnician,
          nome: selectedTechnician,
          disponivel: true
        };
      }
      return null;
    } catch (error) {
      this.handleError(error);
      throw new Error(`Erro ao buscar técnicos disponíveis: ${error.message}`);
    }
  }
}

const technicianService = new TechnicianService();
export default technicianService;