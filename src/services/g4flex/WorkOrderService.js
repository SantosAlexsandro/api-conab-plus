import BaseG4FlexService from './BaseG4FlexService';
import webhookService from './WebhookService';

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

  async closeWorkOrderByCustomerId({ cpf, cnpj, customerId }) {

    try {
      const orders = await this.findOrdersByCustomer({ cpf, cnpj, codigoCliente: customerId });
      console.log(`[G4Flex] Found ${orders.length} orders for customer ${customerId}`);
      if (!orders || orders.length === 0) {
        throw new Error('No orders found for customer');
      }

      orders.map(async order => {
        await this.axiosInstance.post(
          `/api/OrdServ/InserirAlterarOrdServ`,
          {
            CodigoEmpresaFilial: '1',
            Numero: order.Numero,
            codigoEntidade: customerId,
            Contato: "ORDEM CANCELADA X2"
          }
        );

        console.log(`[G4Flex] Closed work order ${order.Numero}`);
      });

      return {
        success: true,
        message: 'Work orders closed successfully',
        orders: orders.map(order => order.Numero)
      };
    } catch (error) {
      this.handleError(error);
      throw new Error(`Error closing work order: ${error.message}`);
    }
  }

  /**
   * Process work order creation asynchronously
   * @param {Object} params - Work order parameters
   * @param {string} params.productId - Product identification code
   * @param {string} params.requesterName - Name of the person requesting
   * @param {string} params.requesterPosition - Position/role of the requester
   * @param {string} params.incidentDescription - Description of the reported problem
   * @param {string} params.siteContactPerson - Person responsible for the site
   * @returns {Promise<Object>} Created work order information
   */
  async createWorkOrder({
    productId,
    requesterName,
    requesterPosition,
    incidentDescription,
    siteContactPerson
  }) {
    try {
      console.log('[WorkOrderService] Starting work order creation process');

      const workOrderData = {
        CodigoEmpresaFilial: '1',
        CodigoProduto: productId,
        NomeSolicitante: requesterName,
        CargoSolicitante: requesterPosition,
        DescricaoProblema: incidentDescription,
        NomeResponsavelLocal: siteContactPerson,
        Status: 'Aberta'
      };

      // 1. Create work order
      console.log('[WorkOrderService] Creating work order in G4Flex');
      const response = await this.axiosInstance.post(
        '/api/OrdServ/InserirAlterarOrdServ',
        workOrderData
      );

      if (!response.data || response.data.error) {
        throw new Error(response.data?.error || 'Failed to create work order');
      }

      const workOrder = {
        number: response.data.Numero,
        status: response.data.Status,
        createdAt: response.data.DataCadastro,
        technician: response.data.NomeTecnico || null
      };

      console.log(`[WorkOrderService] Work order ${workOrder.number} created successfully`);

      // 2. Notify webhook
      console.log('[WorkOrderService] Notifying webhook');
      try {
        await webhookService.notifyWorkOrderCreated({
          workOrderId: workOrder.number,
          technicianName: workOrder.technician
        });
        console.log('[WorkOrderService] Webhook notification sent successfully');
      } catch (webhookError) {
        console.error('[WorkOrderService] Webhook notification failed:', webhookError);
        // Continue processing as the work order was created successfully
      }

      return {
        success: true,
        workOrder,
        webhookNotified: true
      };
    } catch (error) {
      console.error('[WorkOrderService] Error in work order creation process:', error);
      this.handleError(error);
      throw new Error(`Error creating work order: ${error.message}`);
    }
  }
}

export default new WorkOrderService();
