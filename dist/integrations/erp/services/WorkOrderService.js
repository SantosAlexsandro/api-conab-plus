"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// src/integrations/erp/services/WorkOrderService.js

var _BaseERPServicejs = require('./BaseERPService.js'); var _BaseERPServicejs2 = _interopRequireDefault(_BaseERPServicejs);

class WorkOrderService extends _BaseERPServicejs2.default {
  constructor() {
    super();
  }

  async getCurrentStage(workOrderId) {
    try {
      const response = await this.axiosInstance.get(`/api/OrdServ/GetEtapaOrdServ?codigoEmpresaFilial=1&numeroOrdServ=${workOrderId}`);
      const lastStage = response.data.reduce((lastStage, currentStage) => {
        return currentStage.Sequencia > lastStage.Sequencia ? currentStage : lastStage;
    }, { Sequencia: 0, CodigoTipoEtapa: '', Nome: '' });


    if (!Array.isArray(response.data) || response.data.length === 0) {
      throw new Error('Nenhuma etapa retornada para a ordem de serviço no ERP');
    }

    const oldStageData = response.data.map(stage => ({
      ...stage,
      CodigoEmpresaFilial: '1',
      NumeroOrdServ: workOrderId
    }));

      return { currentStageCode: lastStage.CodigoTipoEtapa, lastSequence: lastStage.Sequencia, oldStageData };
    } catch (error) {
      this.handleError(error);
      throw new Error(`Error getting current stage: ${error.message}`);
    }
  }

  async insertHistoryStage(workOrderId, stageData) {
    console.log('INIT insertHistoryStage', workOrderId, stageData);
    try {
      if (!_optionalChain([stageData, 'optionalAccess', _ => _.text]) || typeof stageData.text !== 'string') {
        throw new Error('Texto do histórico é obrigatório e deve ser uma string');
      }

      const response = await this.axiosInstance.post(`/api/OrdServ/SalvarHistoricoEtapa`, {
        CodigoEmpresaFilial: '1',
        Numero: workOrderId,
        EtapaOrdServChildList: [
          {
            NumeroOrdServ: workOrderId,
            HistEtapaOrdServChildList: [
              {
                Texto: _optionalChain([stageData, 'optionalAccess', _2 => _2.text])
              }
            ]
          }
        ]
      });

      console.log('[WorkOrderService] Inserted stage historic', response.data);

      // TODO: Implement this

      return response.data;
    } catch (error) {
      this.handleError(error);
      throw new Error(`Error inserting stage historic: ${error.message}`);
    }
  }
}


exports. default = WorkOrderService;
