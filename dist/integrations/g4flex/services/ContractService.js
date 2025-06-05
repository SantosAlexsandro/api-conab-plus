"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/integrations/g4flex/services/ContractService.js
var _BaseERPService = require('./BaseERPService'); var _BaseERPService2 = _interopRequireDefault(_BaseERPService);
var _CustomerService = require('./CustomerService'); var _CustomerService2 = _interopRequireDefault(_CustomerService);
var _logEvent = require('../../../utils/logEvent'); var _logEvent2 = _interopRequireDefault(_logEvent);
var _resolveNumericIdentifier = require('../utils/resolveNumericIdentifier');

class ContractService extends _BaseERPService2.default {
  constructor() {
    super();
  }

  async checkActiveContract(cpf, cnpj, customerId, uraRequestId) {
    try {
      // Determina o tipo e valor do identificador
      let identifierType, identifierValue;

      if (customerId) {
        identifierType = 'customerId';
        identifierValue = customerId;
      } else if (cpf) {
        identifierType = 'cpf';
        identifierValue = cpf;
      } else if (cnpj) {
        identifierType = 'cnpj';
        identifierValue = cnpj;
      } else {
        throw new Error('Nenhum identificador fornecido (CPF, CNPJ ou customerId)');
      }

      // Busca dados do cliente usando o método unificado
      const customerData = await _CustomerService2.default.getCustomerByIdentifier(identifierType, identifierValue);
      const finalCustomerId = customerData.codigo;
      const customerName = customerData.nome;

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

  async getActiveContract(customerId) {
    const response = await this.axiosInstance.get(`/api/Contrato/RetrievePage?filter=(Status='Ativo' or Status='Suspenso Faturamento') and ContratoPagRec='REC' and CodigoEntidade='${customerId}'&order&pageSize=200&pageIndex=1`);
    console.log(response.data);
    return response.data[0];
  }

}

exports. default = new ContractService();
