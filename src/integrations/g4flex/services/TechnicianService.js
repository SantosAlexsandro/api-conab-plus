import BaseG4FlexService from './BaseG4FlexService';
import logEvent from '../../../utils/logEvent';
import WorkShift from '../../../models/WorkShift';
import { Op } from 'sequelize';
import WorkOrderService from './WorkOrderService';
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

      const openOrders = await WorkOrderService.getOpenOrders();
      console.log(`[TechnicianService] Ordens abertas: ${openOrders.length}`);

      // Obter os técnicos que estão trabalhando em ordens abertas
      const workingTechnicians = [];

      for (const order of openOrders) {
        try {
          const response = await this.axiosInstance.get(
            `/api/OrdServ/Load?codigoEmpresaFilial=1&numero=${order.number}&loadChild=EtapaOrdServChildList`
          );

          if (response.data && response.data.EtapaOrdServChildList && response.data.EtapaOrdServChildList.length > 0) {
            // Encontrar o objeto com o maior número de sequência
            const etapas = response.data.EtapaOrdServChildList;
            const etapaAtual = etapas.reduce((prev, current) =>
              (prev.Sequencia > current.Sequencia) ? prev : current
            );

            // Obter o CodigoUsuario dessa etapa (técnico atual)
            const technicianCode = etapaAtual.CodigoUsuario;
            console.log(`[TechnicianService] Técnico atribuído à ordem ${order.number}: ${technicianCode}`);

            // Adicionar à lista de técnicos trabalhando
            if (technicianCode && !workingTechnicians.includes(technicianCode)) {
              workingTechnicians.push(technicianCode);
            }
          }
        } catch (error) {
          console.error(`[TechnicianService] Erro ao obter dados da ordem ${order.number}:`, error.message);
        }
      }

      console.log(`[TechnicianService] Técnicos trabalhando: ${workingTechnicians.join(', ')}`);

      // Filtrar técnicos que estão em turno ativo mas não estão trabalhando
      const availableTechnicians = activeTechnicianCodes.filter(techCode =>
        !workingTechnicians.includes(techCode)
      );

      console.log(`[TechnicianService] Técnicos disponíveis: ${availableTechnicians.join(', ')}`);

      // Retorna o primeiro técnico disponível ou null
      if (availableTechnicians.length > 0) {
        return {
          id: availableTechnicians[0],
          nome: availableTechnicians[0],
          disponivel: true
        };
      }

      return null;

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
      }

      if (activeTechnicianCodes.length > 0) {
        const selectedTechnician = activeTechnicianCodes[0];
        return {
          id: selectedTechnician,
          nome: selectedTechnician,
          disponivel: true
        };
      }
      return null;
      */
    } catch (error) {
      this.handleError(error);
      throw new Error(`Erro ao buscar técnicos disponíveis: ${error.message}`);
    }
  }




}

const technicianService = new TechnicianService();
export default technicianService;