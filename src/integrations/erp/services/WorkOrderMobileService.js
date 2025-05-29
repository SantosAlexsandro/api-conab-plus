// src/integrations/erp/services/WorkOrderMobileService.js

import BaseERPService from './BaseERPService.js';

class WorkOrderMobileService extends BaseERPService {
  constructor() {
    super();
  }

  async releaseWorkOrder(workOrderNumber, userId = 'CONAB+') {
    try {
      const payload = {
        CodigoEmpresaFilial: '1',
        NumeroOrdServ: workOrderNumber,
        DataHora: new Date().toISOString(),
        CodigoUsuario: userId
      };

      console.log(`[WorkOrderMobileService] Releasing work order ${workOrderNumber} for user ${userId}`);

      const response = await this.axiosInstance.post('/api/OrdServMobile/Liberar', payload);

      console.log(`[WorkOrderMobileService] Work order ${workOrderNumber} released successfully`);

      return response.data;
    } catch (error) {
      console.error(`[WorkOrderMobileService] Error releasing work order ${workOrderNumber}:`, error);
      this.handleError(error);
      throw new Error(`Error releasing work order: ${error.message}`);
    }
  }
}

export default WorkOrderMobileService;
