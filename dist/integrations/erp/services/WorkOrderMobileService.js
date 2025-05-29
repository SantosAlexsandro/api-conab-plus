"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/integrations/erp/services/WorkOrderMobileService.js

var _BaseERPServicejs = require('./BaseERPService.js'); var _BaseERPServicejs2 = _interopRequireDefault(_BaseERPServicejs);

class WorkOrderMobileService extends _BaseERPServicejs2.default {
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

exports. default = WorkOrderMobileService;
