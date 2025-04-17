"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _BaseG4FlexService = require('./BaseG4FlexService'); var _BaseG4FlexService2 = _interopRequireDefault(_BaseG4FlexService);
var _logEvent = require('../../../utils/logEvent'); var _logEvent2 = _interopRequireDefault(_logEvent);
var _WorkShift = require('../../../models/WorkShift'); var _WorkShift2 = _interopRequireDefault(_WorkShift);
var _sequelize = require('sequelize');

class TechnicianService extends _BaseG4FlexService2.default {
  constructor() {
    super();
  }

  async getAvailableTechnician() {
    try {
      // Buscar turnos ativos no momento atual
      const now = new Date();
      const activeShifts = await _WorkShift2.default.findAll({
        where: {
          status: 'ACTIVE',
          start_time: { [_sequelize.Op.lte]: now },
          end_time: { [_sequelize.Op.gte]: now },
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
exports. default = technicianService;