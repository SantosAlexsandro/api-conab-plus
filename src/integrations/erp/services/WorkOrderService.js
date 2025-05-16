// src/integrations/erp/services/WorkOrderService.js

import BaseERPService from './BaseERPService.js';

class WorkOrderService extends BaseERPService {
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
    try {
      if (!stageData?.text || typeof stageData.text !== 'string') {
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
                Texto: stageData?.text
              }
            ]
          }
        ]
      });

      // TODO: Implement this

      return response.data;
    } catch (error) {
      this.handleError(error);
      throw new Error(`Error inserting stage historic: ${error.message}`);
    }
  }
}


export default WorkOrderService;
