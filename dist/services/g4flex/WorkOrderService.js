"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _BaseG4FlexService = require('./BaseG4FlexService'); var _BaseG4FlexService2 = _interopRequireDefault(_BaseG4FlexService);
var _WebhookService = require('./WebhookService'); var _WebhookService2 = _interopRequireDefault(_WebhookService);

class WorkOrderService extends _BaseG4FlexService2.default {
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

  async checkWorkOrdersByCustomerId({ cpf, cnpj, customerId }) {
    try {
      let finalCustomerCode = customerId;

      if (!finalCustomerCode) {
        const document = cpf || cnpj;
        if (!document) {
          throw new Error('CPF or CNPJ not provided');
        }
        const customerData = await this.getCustomerData(document);
        finalCustomerCode = customerData.codigo;
        console.log('[G4Flex] Customer code:', finalCustomerCode);
      }

      const startDate = new Date(new Date().setDate(new Date().getDate() - this.DATE_RANGE.DAYS_BEFORE)).toISOString();
      const endDate = new Date(new Date().setDate(new Date().getDate() + this.DATE_RANGE.DAYS_AFTER)).toISOString();

      const filter = `ISNULL(DataEncerramento) AND CodigoEntidade=${finalCustomerCode} AND (DataCadastro >= %23${startDate}%23 AND DataCadastro < %23${endDate}%23)`;
      const queryParams = `filter=${filter}&order=&pageSize=${this.DATE_RANGE.PAGE_SIZE}&pageIndex=${this.DATE_RANGE.PAGE_INDEX}`;

      const response = await this.axiosInstance.get(`/api/OrdServ/RetrievePage?${queryParams}`);
      const orders = response.data;

      console.log('[G4Flex] Found', orders.length, 'orders for customer', finalCustomerCode);

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
      let finalCustomerCode = customerId;

      if (!finalCustomerCode) {
        const document = cpf || cnpj;
        if (!document) {
          throw new Error('CPF or CNPJ not provided');
        }
        const customerData = await this.getCustomerData(document);
        finalCustomerCode = customerData.codigo;
        console.log('[G4Flex] Customer code:', finalCustomerCode);
      }

      const startDate = new Date(new Date().setDate(new Date().getDate() - this.DATE_RANGE.DAYS_BEFORE)).toISOString();
      const endDate = new Date(new Date().setDate(new Date().getDate() + this.DATE_RANGE.DAYS_AFTER)).toISOString();

      const filter = `ISNULL(DataEncerramento) AND CodigoEntidade=${finalCustomerCode} AND (DataCadastro >= %23${startDate}%23 AND DataCadastro < %23${endDate}%23)`;
      const queryParams = `filter=${filter}&order=&pageSize=${this.DATE_RANGE.PAGE_SIZE}&pageIndex=${this.DATE_RANGE.PAGE_INDEX}`;

      const response = await this.axiosInstance.get(`/api/OrdServ/RetrievePage?${queryParams}`);
      const orders = response.data;

      console.log(`[G4Flex] Found ${orders.length} orders for customer ${finalCustomerCode}`);
      if (!orders || orders.length === 0) {
        throw new Error('No orders found for customer');
      }

      await Promise.all(orders.map(async order => {
        await this.axiosInstance.post(
          `/api/OrdServ/InserirAlterarOrdServ`,
          {
            CodigoEmpresaFilial: '1',
            Numero: order.Numero,
            codigoEntidade: finalCustomerCode,
            Contato: "ORDEM CANCELADA X2"
          }
        );

        console.log(`[G4Flex] Closed work order ${order.Numero}`);
      }));

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
        throw new Error(_optionalChain([response, 'access', _ => _.data, 'optionalAccess', _2 => _2.error]) || 'Failed to create work order');
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
        await _WebhookService2.default.notifyWorkOrderCreated({
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

exports. default = new WorkOrderService();
