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

}

export default WorkOrderService;
