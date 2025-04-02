import BaseG4FlexService from './BaseG4FlexService';

class WorkOrderService extends BaseG4FlexService {
  constructor() {
    super();
    // Constants for date range
    this.DATE_RANGE = {
      DAYS_BEFORE: 1,
      DAYS_AFTER: 1,
      PAGE_SIZE: 10,
      PAGE_INDEX: 1
    };
  }

  /**
   * Search work orders by customer
   * @param {Object} params - Search parameters
   * @param {string} [params.cpf] - Customer CPF (11 digits)
   * @param {string} [params.cnpj] - Customer CNPJ (14 digits)
   * @param {string} [params.codigoCliente] - Customer code in G4Flex
   * @returns {Promise<Array<Object>>} List of work orders with their details
   * @throws {Error} When customer code cannot be found or API request fails
   */
  async findOrdersByCustomer({ cpf, cnpj, codigoCliente }) {
    try {
      let finalCustomerCode = codigoCliente;

      if (!finalCustomerCode) {
        const document = cpf || cnpj;
        if (!document) {
          throw new Error('CPF or CNPJ not provided');
        }
        finalCustomerCode = await this.getCustomerCode(document);
      }

      const startDate = new Date(new Date().setDate(new Date().getDate() - this.DATE_RANGE.DAYS_BEFORE)).toISOString();
      const endDate = new Date(new Date().setDate(new Date().getDate() + this.DATE_RANGE.DAYS_AFTER)).toISOString();

      const filter = `ISNULL(DataEncerramento) AND CodigoEntidade=${finalCustomerCode} AND (DataCadastro >= %23${startDate}%23 AND DataCadastro < %23${endDate}%23)`;
      const queryParams = `filter=${filter}&order=&pageSize=${this.DATE_RANGE.PAGE_SIZE}&pageIndex=${this.DATE_RANGE.PAGE_INDEX}`;

      const response = await this.axiosInstance.get(`/api/OrdServ/RetrievePage?${queryParams}`);

      console.log(`[G4Flex] Searching work orders for customer ${finalCustomerCode}. Endpoint: /api/OrdServ/RetrievePage?${queryParams}`);

      return response.data;
    } catch (error) {
      this.handleError(error);
      throw new Error(`Error searching work orders: ${error.message}`);
    }
  }

  async findFinishedStageByOrder(orderNumber) {
    try {
      const response = await this.axiosInstance.get(`/api/OrdServ/Load?codigoEmpresaFilial=1&numero=${orderNumber}&loadChild=EtapaOrdServChildList`);

      const finishedStage = response.data.EtapaOrdServChildList.find(stage => stage.CodigoTipoEtapa === '007.007');
      console.log(`[G4Flex] Finished stage by order ${orderNumber}: ${finishedStage}`);
      return finishedStage;
    } catch (error) {
      this.handleError(error);
      throw new Error(`Error finding finished stage by order: ${error.message}`);
    }
  }

}

export default new WorkOrderService();
