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

      console.log(`[G4Flex] Found ${response.data.length} work orders for customer ${finalCustomerCode}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw new Error(`Error searching work orders: ${error.message}`);
    }
  }

  /**
   * Check if a work order is finished by checking its stages
   * @param {string} orderNumber - Work order number
   * @returns {Promise<boolean>} True if the order is finished, false otherwise
   */
  async isOrderFinished(orderNumber) {
    try {
      const response = await this.axiosInstance.get(
        `/api/OrdServ/Load?codigoEmpresaFilial=1&numero=${orderNumber}&loadChild=EtapaOrdServChildList`
      );

      const finishedStage = response.data.EtapaOrdServChildList.find(
        stage => stage.CodigoTipoEtapa === '007.007'
      );

      console.log(`[G4Flex] Order ${orderNumber} finished stage: ${finishedStage ? 'Yes' : 'No'}`);
      return !!finishedStage;
    } catch (error) {
      this.handleError(error);
      throw new Error(`Error checking if order is finished: ${error.message}`);
    }
  }

  /**
   * Check work orders status for a customer
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Work orders status information
   */
  async checkWorkOrdersStatus({ cpf, cnpj, codigoCliente }) {
    try {
      // 1. Buscar todas as ordens do cliente
      const orders = await this.findOrdersByCustomer({ cpf, cnpj, codigoCliente });

      if (!orders || orders.length === 0) {
        return {
          customerHasOpenOrders: false,
          quantityOrders: 0,
          orders: []
        };
      }

      // 2. Verificar o status de cada ordem
      const orderStatuses = await Promise.all(
        orders.map(async order => ({
          order,
          isFinished: await this.isOrderFinished(order.Numero)
        }))
      );

      // 3. Filtrar apenas ordens não finalizadas
      const openOrders = orderStatuses
        .filter(status => !status.isFinished)
        .map(status => status.order);

      return {
        customerHasOpenOrders: openOrders.length > 0,
        quantityOrders: openOrders.length,
        orders: openOrders.map(order => ({
          number: order.Numero,
          registrationDate: order.DataCadastro
        }))
      };
    } catch (error) {
      this.handleError(error);
      throw new Error(`Error checking work orders status: ${error.message}`);
    }
  }
}

export default new WorkOrderService();
