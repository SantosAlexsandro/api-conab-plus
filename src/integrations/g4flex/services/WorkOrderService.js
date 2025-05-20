// src/integrations/g4flex/services/WorkOrderService.js

import BaseG4FlexService from './BaseG4FlexService';
import logEvent from '../../../utils/logEvent';
import technicianService from './TechnicianService';
import workOrderQueue from '../queues/workOrder.queue';
import entityService from './EntityService';
import contractService from './ContractService';
import WorkOrderERPService from '../../../integrations/erp/services/WorkOrderService';
import EmployeeERPService from '../../../integrations/erp/services/EmployeeERPService';
class WorkOrderService extends BaseG4FlexService {
  constructor() {
    super();
    // Constants for date range
    this.DATE_RANGE = {
      DAYS_BEFORE: 1,
      DAYS_AFTER: 1,
      PAGE_SIZE: 20,
      PAGE_INDEX: 1
    };
    this.ERP_SERVICE = new WorkOrderERPService();
    this.EMPLOYEE_SERVICE = new EmployeeERPService();
  }

   // Criar Ordem de Serviço
   async createWorkOrder({
    uraRequestId,
    identifierType,
    identifierValue,
    productId,
    requesterNameAndPosition,
    incidentAndReceiverName,
    requesterContact
  }) {
    try {
      console.log('[WorkOrderService] Starting work order creation process');

      // Busca dados do cliente usando o método otimizado
      const customerData = await entityService.getCustomerByIdentifier(identifierType, identifierValue);
      const finalCustomerId = customerData.codigo;

      const contractData = await contractService.getActiveContract(finalCustomerId);

      const workOrderData = {
        CodigoEntidade: finalCustomerId,
        CodigoEntidadeAtendida: finalCustomerId,
        CodigoTipoOrdServ: '007',
        CodigoTipoAtendContrato: '0000002',
        CodigoProduto: productId,
        NumeroContrato: contractData.Numero,
        CodigoEmpresaFilialContrato: '1',
        CodigoUsuario: 'CONAB+',
        EtapaOrdServChildList: [
          {
            CodigoEmpresaFilial: '1',
            Sequencia: 1,
            CodigoTipoEtapa: '007.008',
            CodigoTipoEtapaProxima: '007.002',
            CodigoUsuario: 'CONAB+',
            DataHoraInicial: new Date().toISOString(),
            DataHoraFim: new Date().toISOString()
          },
          {
            CodigoEmpresaFilial: '1',
            Sequencia: 2,
            CodigoTipoEtapa: '007.002',
            CodigoUsuario: 'CONAB+',
            DataHoraInicial: new Date().toISOString(),
            //CodigoUsuarioAlteracao: "CONAB+"
          }
        ],
      };

      // 1. Create work order
      console.log('[WorkOrderService] Creating work order in ERP by');
      const response = await this.axiosInstance.post(
        '/api/OrdServ/InserirAlterarOrdServ',
        workOrderData
      );

      // 1. update priority
      console.log('[WorkOrderService] Updating priority in ERP by');
      const responsePriority = await this.axiosInstance.post(
        '/api/OrdServ/SavePartial?action=Update',
        {
          CodigoEmpresaFilial: '1',
          Numero: response.data.Numero,
          OrdServ1Object: {
            CodigoEmpresaFilial: "1",
            Numero: response.data.Numero,
            AtendimentoPrioritario: "Sim"
          }
        }
      );

      // Insert history stage
      await this.ERP_SERVICE.insertHistoryStage(response.data.Numero, {
        text: `OS gerada por CONAB+ (FASE BETA)\n\nNOME SOLICITANTE: ${requesterNameAndPosition}\nPROBLEMA RELATADO: ${incidentAndReceiverName}\nCONTATO: ${requesterContact}`
      });

      if (!response.data || response.data.error) {
        await logEvent({
          uraRequestId,
          source: 'g4flex',
          action: 'work_order_create_error',
          payload: { finalCustomerId, productId, requesterNameAndPosition, incidentAndReceiverName, requesterContact },
          response: { error: response.data?.error || 'Failed to create work order' }
        });
        throw new Error(response.data?.error || 'Failed to create work order');
      }

      await logEvent({
        uraRequestId,
        source: 'g4flex',
        action: 'work_order_create_success',
        payload: { finalCustomerId, productId, requesterNameAndPosition, incidentAndReceiverName, requesterContact },
        response: { workOrder: response?.data?.Numero }
      });

      console.log(`[WorkOrderService] Work order ${response?.data?.Numero} created successfully`);

      // 2. Notify webhook
      console.log('[WorkOrderService] Notifying webhook');
      try {
        await workOrderQueue.add('processWorkOrderFeedback', {
          orderId: response?.data?.Numero,
          feedback: 'work_order_created',
          uraRequestId: uraRequestId,
          customerName: customerData.nome,
          requesterContact: requesterContact
        });

        console.log('[WorkOrderService] Webhook notification scheduled successfully');
      } catch (webhookError) {
        await logEvent({
          uraRequestId,
          source: 'g4flex',
          action: 'work_order_create_webhook_error',
          payload: { finalCustomerId, productId, requesterNameAndPosition, incidentAndReceiverName, requesterContact },
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
        source: 'g4flex',
        action: 'work_order_create_error',
        payload: { identifierType, identifierValue, productId, requesterNameAndPosition, incidentAndReceiverName, requesterContact },
        response: { error: error.message },
        statusCode: 500,
        error: error.message
      });

      console.error('[WorkOrderService] Error in work order creation process:', error);
      this.handleError(error);
      throw new Error(`Error creating work order: ${error.message}`);
    }
  }


  async isOrderFulfilledORCancelled(orderNumber) {
    try {
      const response = await this.axiosInstance.get(
        `/api/OrdServ/Load?codigoEmpresaFilial=1&numero=${orderNumber}&loadChild=EtapaOrdServChildList`
      );

      const cancelledStage = response.data.EtapaOrdServChildList.find(
        stage => stage.CodigoTipoEtapa === '007.003' || stage.CodigoTipoEtapa === '007.021'
      );

      const fulfilledStage = response.data.EtapaOrdServChildList.find(
        stage => stage.CodigoTipoEtapa === '007.007'
      );

      const isFinished = !!cancelledStage || !!fulfilledStage;
      const status = {
        isFinished,
        isCancelled: !!cancelledStage,
        isFulfilled: !!fulfilledStage
      };

      console.log(`[G4Flex] Order ${orderNumber} status: ${isFinished ? (cancelledStage ? 'Cancelled' : 'Fulfilled') : 'Not Finished'}`);
      return status;
    } catch (error) {
      this.handleError(error);
      throw new Error(`Error checking if order is finished: ${error.message}`);
    }
  }

  // Buscar todas as ordens abertas
  async getAllOpenOrders() {
    try {
      const startDate = new Date(new Date().setDate(new Date().getDate() - this.DATE_RANGE.DAYS_BEFORE)).toISOString();
      const endDate = new Date(new Date().setDate(new Date().getDate() + this.DATE_RANGE.DAYS_AFTER)).toISOString();

      const filter = `ISNULL(DataEncerramento) AND CodigoTipoOrdServ=007 AND ISNULL(NumeroOrdServReferencia) AND (DataCadastro >= %23${startDate}%23 AND DataCadastro < %23${endDate}%23)`;
      const queryParams = `filter=${filter}&order=&pageSize=${this.DATE_RANGE.PAGE_SIZE}&pageIndex=${this.DATE_RANGE.PAGE_INDEX}`;
      const response = await this.axiosInstance.get(`/api/OrdServ/RetrievePage?${queryParams}`);
      const orders = response.data;

      if (!orders || orders.length === 0) {
        return {
          orders: []
        };
      }

      // 2. Verificar o status de cada ordem
      const orderStatuses = await Promise.all(
        orders.map(async order => ({
          order,
          ...(await this.isOrderFulfilledORCancelled(order.Numero))
        }))
      );

      // 3. Filtrar apenas ordens não finalizadas
      const openOrders = orderStatuses
        .filter(status => !status.isFinished)
        .map(status => status.order);

      return openOrders.map(order => ({
        number: order.Numero,
        registrationDate: order.DataCadastro
      }))

    } catch (error) {
      this.handleError(error);
      throw new Error(`Error getting open orders: ${error.message}`);
    }
  }

  // Buscar todas as ordens abertas por cliente
  async getOpenOrdersByCustomerId({ identifierType, identifierValue, uraRequestId }) {
    try {
      // Busca dados do cliente usando o método otimizado
      const customerData = await entityService.getCustomerByIdentifier(identifierType, identifierValue);
      const finalCustomerCode = customerData.codigo;

      const startDate = new Date(new Date().setDate(new Date().getDate() - this.DATE_RANGE.DAYS_BEFORE)).toISOString();
      const endDate = new Date(new Date().setDate(new Date().getDate() + this.DATE_RANGE.DAYS_AFTER)).toISOString();

      const filter = `ISNULL(DataEncerramento) AND CodigoEntidade=${finalCustomerCode} AND CodigoTipoOrdServ=007 AND ISNULL(NumeroOrdServReferencia) AND (DataCadastro >= %23${startDate}%23 AND DataCadastro < %23${endDate}%23)`;
      const queryParams = `filter=${filter}&order=&pageSize=${this.DATE_RANGE.PAGE_SIZE}&pageIndex=${this.DATE_RANGE.PAGE_INDEX}`;

      const response = await this.axiosInstance.get(`/api/OrdServ/RetrievePage?${queryParams}`);
      const orders = response.data;

      console.log('[G4Flex] Found', orders.length, 'orders for customer', finalCustomerCode);

      if (!orders || orders.length === 0) {
        return {
          customerHasOpenOrders: false,
          orders: []
        };
      }

      // 2. Verificar o status de cada ordem
      const orderStatuses = await Promise.all(
        orders.map(async order => ({
          order,
          ...(await this.isOrderFulfilledORCancelled(order.Numero))
        }))
      );

      // 3. Filtrar apenas ordens não finalizadas
      const openOrders = orderStatuses
        .filter(status => !status.isFinished)
        .map(status => status.order);

      return {
        customerHasOpenOrders: openOrders.length > 0,
        orders: openOrders.map(order => ({
          number: order.Numero,
          registrationDate: order.DataCadastro
        }))
      };
    } catch (error) {
      await logEvent({
        uraRequestId,
        source: 'system',
        action: 'get_open_orders_by_customer_id_error',
        payload: { identifierType, identifierValue },
        response: { error: error.message }
      });
      this.handleError(error);
      throw new Error(`Error getting open work orders: ${error.message}`);
    }
  }

  async closeWorkOrderByCustomerId({ identifierType, identifierValue, uraRequestId, cancellationRequesterInfo }) {
    try {
      // Busca dados do cliente usando o método otimizado
      const customerData = await entityService.getCustomerByIdentifier(identifierType, identifierValue);
      const finalCustomerCode = customerData.codigo;

      const openOrders = await this.getOpenOrdersByCustomerId({ identifierType, identifierValue, uraRequestId });

      console.log(`[G4Flex] Found ${openOrders.orders.length} orders for customer ${finalCustomerCode}`);
      if (!openOrders || openOrders.orders.length === 0) {
        throw new Error('No orders found for customer');
      }

      await Promise.all(openOrders.orders.map(async order => {
        const { currentStageCode, lastSequence, oldStageData } = await this.getCurrentStage(order.number);
        console.log(`[G4Flex] Current stage : ${currentStageCode}`);

        if (currentStageCode === '007.003' || currentStageCode === '007.021') {
          console.log(`[G4Flex] Order ${order.number} is already closed`);
          return;
        }

        if (currentStageCode === '007.002') {
          await this.axiosInstance.post(
            '/api/OrdServ/SavePartial?action=Update',
            {
              CodigoEmpresaFilial: '1',
              Numero: order.number,
              EtapaOrdServChildList: [
                ...oldStageData,
                { CodigoEmpresaFilial: '1', NumeroOrdServ: order.number, Sequencia: lastSequence + 1, CodigoTipoEtapa: '007.003', CodigoUsuario: 'CONAB+' }
              ]
            }
          );

          await this.ERP_SERVICE.insertHistoryStage(order.number, {
            text: `DETALHES DO CANCELAMENTO: ${cancellationRequesterInfo}`
          });

          console.log(`[G4Flex] Closed work order ${order.number}`);
          return;
        } else if (currentStageCode === '007.004') {
          await this.axiosInstance.post(
            '/api/OrdServ/SavePartial?action=Update',
            {
              CodigoEmpresaFilial: '1',
              Numero: order.number,
              EtapaOrdServChildList: [
                ...oldStageData,
                { CodigoEmpresaFilial: '1', NumeroOrdServ: order.number, Sequencia: lastSequence + 1, CodigoTipoEtapa: '007.021', CodigoUsuario: 'CONAB+' }
              ]
            }
          );
          console.log(`[G4Flex] Closed work order ${order.number}`);
          return;
        } else {
          console.log(`[G4Flex] Order ${order.number} is in an unknown stage`);
        }
      }));

      return {
        success: true,
        message: 'Work orders closed successfully',
        orders: openOrders.orders.map(order => order.number)
      };
    } catch (error) {
      await logEvent({
        uraRequestId,
        source: 'g4flex',
        action: 'work_order_close_error',
        payload: { identifierType, identifierValue },
        response: { error: error.message }
      });
      this.handleError(error);
      throw new Error(`Error closing work order: ${error.message}`);
    }
  }

  async getCurrentStage(workOrderId) {
    const { currentStageCode, lastSequence, oldStageData } = await this.ERP_SERVICE.getCurrentStage(workOrderId);
    return { currentStageCode, lastSequence, oldStageData };
  }

  // Atribuir técnico à OS
  async assignTechnicianToWorkOrder(workOrderId, uraRequestId) {

    try {
      const technician = await technicianService.getAvailableTechnician();

      if (technician) {
        console.log('[WorkOrderService] Atribuindo técnico à ordem de serviço');
        await this.axiosInstance.post(
          `/api/OrdServ/InserirAlterarOrdServ`,
          {
            CodigoEmpresaFilial: "1",
            Numero: workOrderId,
            CodigoTipoEtapa: "007.004",
            CodigoUsuario: "CONAB+",
            EtapaOrdServChildList: [
              {
                CodigoEmpresaFilial: "1",
                NumeroOrdServ: workOrderId,
                Sequencia: 2,
                CodigoTipoEtapaProxima: "007.004",
                DataHoraFim: new Date().toISOString(),
                CodigoUsuario: "CONAB+",
                CodigoUsuarioAlteracao: "CONAB+"
              },
              {
                CodigoEmpresaFilial: "1",
                NumeroOrdServ: workOrderId,
                Sequencia: 3,
                CodigoTipoEtapa: "007.004",
                CodigoUsuario: technician.id,
                CodigoUsuarioAlteracao: "CONAB+",
                DataHoraInicial: new Date().toISOString(),
              }
            ]
          }
        );

        // Adicionar na fila de feedback para notificar sobre a atribuição do técnico
        try {
          await workOrderQueue.add('processWorkOrderFeedback', {
            orderId: workOrderId,
            feedback: 'technician_assigned',
            technicianName: technician.nome,
            technicianId: technician.id,
            uraRequestId: uraRequestId
          });
          console.log(`[WorkOrderService] Feedback de atribuição de técnico agendado para ordem ${workOrderId}`);
        } catch (feedbackError) {
          console.error(`[WorkOrderService] Erro ao agendar feedback de atribuição: ${feedbackError.message}`);
        }

        return { success: true, orderId: workOrderId, technicianId: technician.id };
      } else {
        // Sem técnico disponível, o reagendamento será feito pelo worker

        return { success: false, noTechnician: true };
      }
    } catch (error) {
      await logEvent({
        uraRequestId,
        source: 'g4flex',
        action: 'work_order_assign_technician_error',
        payload: { workOrderId },
        response: { error: error.message }
      });
      this.handleError(error);
      throw new Error(`Erro ao atribuir técnico à ordem de serviço: ${error.message}`);
    }
  }
}

export default new WorkOrderService();
