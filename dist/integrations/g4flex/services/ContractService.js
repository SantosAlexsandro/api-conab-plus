"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/integrations/g4flex/services/ContractService.js
var _BaseG4FlexService = require('./BaseG4FlexService'); var _BaseG4FlexService2 = _interopRequireDefault(_BaseG4FlexService);
var _logEvent = require('../../../utils/logEvent'); var _logEvent2 = _interopRequireDefault(_logEvent);

class ContractService extends _BaseG4FlexService2.default {
  constructor() {
    super();
  }

  async checkActiveContract(cpf, cnpj, customerId, uraRequestId) {
    try {
      let finalCustomerId = customerId;
      let customerName = null;

      if (!finalCustomerId) {
        const document = cpf || cnpj;
        const customerData = await this.getCustomerData(document);
        finalCustomerId = customerData.codigo;
        customerName = customerData.nome;
      } else {
        // Se já temos o customerId, buscamos o nome
        const customerData = await this.getCustomerDataById(finalCustomerId);
        customerName = customerData.nome;
      }

      const contractResponse = await this.axiosInstance.get(
        `/api/Contrato/RetrievePage?filter=(Status='Ativo'or Status='Suspenso Faturamento') and ContratoPagRec='REC' and CodigoEntidade='${finalCustomerId}'&order&pageSize=200&pageIndex=1`
      );

      const responseData = {
        customerId: finalCustomerId,
        hasActiveContract: this.validateActiveContract(contractResponse.data),
        customerName
      };

      return responseData;
    } catch (error) {

      // Propaga o erro original com status code
      throw error;
    }
  }

  validateActiveContract(contractData) {
    return contractData && contractData.length > 0;
  }
}

exports. default = new ContractService();
