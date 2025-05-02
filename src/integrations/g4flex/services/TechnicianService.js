import BaseG4FlexService from './BaseG4FlexService';
import logEvent from '../../../utils/logEvent';
import WorkShift from '../../../models/WorkShift';
import { Op } from 'sequelize';
import WorkOrderService from './WorkOrderService';
import TechnicianERPService from '../../erp/services/TechnicianERPService';

class TechnicianService extends BaseG4FlexService {
  constructor() {
    super();
    this.erp = new TechnicianERPService();
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
      const workingTechs = [];

      for (const order of openOrders) {
        try {
          console.log(`[TechnicianService] Buscando técnico para ordem ${order.number}`);
          const tech = await this.erp.getTechnicianFromOrder(order.number);
          if (tech && !workingTechs.includes(tech)) workingTechs.push(tech);
        } catch (err) {
          console.error(`[TechnicianService] Erro em ordem ${order.number}: ${err.message}`);
        }
      }

      console.log(`[TechnicianService] Técnicos trabalhando: ${workingTechs.join(', ')}`);

      // Filtrar técnicos que estão em turno ativo mas não estão trabalhando
      const availableTechnicians = activeTechnicianCodes.filter(techCode =>
        !workingTechs.includes(techCode)
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
    } catch (error) {
      this.handleError(error);
      throw new Error(`Erro ao buscar técnicos disponíveis: ${error.message}`);
    }
  }

  async activeTechniciansFromERP() {
    return this.erp.getActiveTechsFromEmployeeList();
  }
}

const technicianService = new TechnicianService();
export default technicianService;