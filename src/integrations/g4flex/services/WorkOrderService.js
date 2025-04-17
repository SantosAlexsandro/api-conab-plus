// src/integrations/g4flex/services/WorkOrderService.js

import BaseG4FlexService from './BaseG4FlexService';
import webhookService from './WebhookService';
import { determineIdentifierType } from '../utils/uraValidator';
import { formatCustomerId } from '../../../utils/string/formatUtils';
import logEvent from '../../../utils/logEvent';

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


  // Criar Ordem de Serviço
  async createWorkOrder({
    uraRequestId,
    cpf,
    cnpj,
    customerId,
    productId,
    requesterNameAndPosition,
    IncidentAndReceiverName,
    requesterWhatsApp
  }) {
    try {
      console.log('[WorkOrderService] Starting work order creation process');

      let finalCustomerId = customerId;

      if (!finalCustomerId) {
        const document = cpf || cnpj;
        const customerData = await this.getCustomerData(document);
        finalCustomerId = customerData.codigo;
      }

      const workOrderData = {
        CodigoEntidade: finalCustomerId,
        CodigoEntidadeAtendida: finalCustomerId,
        CodigoTipoOrdServ: '007',
        CodigoTipoAtendContrato: '0000002',
        CodigoProduto: productId,
        //NumeroContrato: '0017693',
        EtapaOrdServChildList: [
          {
            CodigoEmpresaFilial: '1',
            Sequencia: 1,
            CodigoTipoEtapa: '007.008',
            CodigoTipoEtapaProxima: '007.002',
            CodigoUsuario: 'CONAB+'
          },
          {
            CodigoEmpresaFilial: '1',
            Sequencia: 2,
            CodigoTipoEtapa: '007.002',
            CodigoUsuario: 'CONAB+'
          }
        ]
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

      await logEvent({
        uraRequestId,
        source: 'service_g4flex',
        action: 'work_order_create_success',
        payload: { finalCustomerId, productId, requesterNameAndPosition, IncidentAndReceiverName, requesterWhatsApp },
        response: { workOrder: response?.data?.Numero }
      });

      console.log(`[WorkOrderService] Work order ${response?.data?.Numero} created successfully`);

      // 2. Notify webhook
      console.log('[WorkOrderService] Notifying webhook');
      try {
        await webhookService.notifyWorkOrderCreated({
          workOrderId: response?.data?.Numero
        });

        await logEvent({
          uraRequestId,
          source: 'service_g4flex',
          action: 'work_order_create_webhook_success',
          payload: { finalCustomerId, productId, requesterNameAndPosition, IncidentAndReceiverName, requesterWhatsApp },
          response: { workOrder: response?.data?.Numero }
        });
        console.log('[WorkOrderService] Webhook notification sent successfully');
      } catch (webhookError) {
        await logEvent({
          uraRequestId,
          source: 'service_g4flex',
          action: 'work_order_create_webhook_error',
          payload: { finalCustomerId, productId, requesterNameAndPosition, IncidentAndReceiverName, requesterWhatsApp },
          response: { error: webhookError.message },
          statusCode: 500,
          error: webhookError.message
        });

        console.error('[WorkOrderService] Webhook notification failed:', webhookError);
        // Continue processing as the work order was created successfully
      }

      return {
        success: true,
        workOrder: response?.data?.Numero,
        webhookNotified: true
      };

    } catch (error) {
      await logEvent({
        uraRequestId,
        source: 'service_g4flex',
        action: 'work_order_create_error',
        payload: { cpf, cnpj, customerId, productId, requesterNameAndPosition, IncidentAndReceiverName, requesterWhatsApp },
        response: { error: error.message },
        statusCode: 500,
        error: error.message
      });

      console.error('[WorkOrderService] Error in work order creation process:', error);
      this.handleError(error);
      throw new Error(`Error creating work order: ${error.message}`);
    }
  }

  async assignTechnicianToWorkOrder(workOrderId, technicianId) {
    try {
      const response = await this.axiosInstance.post(
        `/api/OrdServ/SavePartial?action=Update`,
        {
          CodigoEmpresaFilial: "1",
          Numero: workOrderId,
          EtapaOrdServChildList: [
            {
              CodigoEmpresaFilial: "1",
              NumeroOrdServ: workOrderId,
              Sequencia: 2,
              CodigoTipoEtapaProxima: "007.004"
            },
            {
              CodigoEmpresaFilial: "1",
              NumeroOrdServ: workOrderId,
              Sequencia: 1
            },
            {
              CodigoEmpresaFilial: "1",
              NumeroOrdServ: workOrderId,
              Sequencia: 3,
              CodigoTipoEtapa: "007.004",
              CodigoUsuario: technicianId,
              CodigoUsuarioAlteracao: "CONAB+"
            }
          ]
        }

      );

      return response.data;
    } catch (error) {
      this.handleError(error);
      throw new Error(`Error assigning technician to work order: ${error.message}`);
    }
  }

}

export default new WorkOrderService();
