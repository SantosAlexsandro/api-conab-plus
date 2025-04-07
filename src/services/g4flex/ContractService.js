// src/services/g4flex/ContractService.js
import BaseG4FlexService from './BaseG4FlexService';
import logEvent from '../../utils/logEvent';

class ContractService extends BaseG4FlexService {
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
        `/api/Contrato/RetrievePage?filter=Status='Ativo' and ContratoPagRec='REC' and CodigoEntidade='${finalCustomerId}'&order&pageSize=200&pageIndex=1`
      );

      const responseData = {
        customerId: finalCustomerId,
        customerName,
        hasActiveContract: this.validateActiveContract(contractResponse.data)
      };

      return responseData;
    } catch (error) {

      // Propaga o erro original com status code
      throw error;
    }
  }

  /**
   * Validates if there is an active contract
   * @param {Array} contractData - Contract data from API
   * @returns {boolean} Whether there is an active contract
   */
  validateActiveContract(contractData) {
    return contractData && contractData.length > 0;
  }
}

export default new ContractService();
