import BaseG4FlexService from './BaseG4FlexService';

class ContractService extends BaseG4FlexService {
  constructor() {
    super();
  }

  /**
   * Checks if the customer has an active contract
   * @param {string} cpf - Customer CPF
   * @param {string} cnpj - Customer CNPJ
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Contract status information
   */
  async checkActiveContract(cpf, cnpj, customerId) {
    console.log('INIT checkActiveContract', cpf, cnpj, customerId);
    //TODO: retirar pontos e hifens do cpf e cnpj
    try {
      let finalCustomerId = customerId;
      if (!finalCustomerId) {
        const document = cpf || cnpj;
        finalCustomerId = await this.getCustomerCode(document);
      }

      const contractResponse = await this.axiosInstance.get(
        `/api/Contrato/RetrievePage?filter=Status='Ativo' and ContratoPagRec='REC' and CodigoEntidade=${finalCustomerId}&order&pageSize=200&pageIndex=1`
      );

      // TODO: Include Billing Suspended Status

      return {
        customerId: finalCustomerId,
        hasActiveContract: this.validateActiveContract(contractResponse.data),
      };
    } catch (error) {
      this.handleError(error);
      throw new Error(`Error checking contract: ${error.message}`);
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