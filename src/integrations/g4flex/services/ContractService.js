// src/integrations/g4flex/services/ContractService.js
import BaseG4FlexService from './BaseG4FlexService';
import entityService from './EntityService';
import logEvent from '../../../utils/logEvent';
import { resolveNumericIdentifier } from '../utils/resolveNumericIdentifier';

class ContractService extends BaseG4FlexService {
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
      const customerData = await entityService.getCustomerByIdentifier(identifierType, identifierValue);
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
}

export default new ContractService();
