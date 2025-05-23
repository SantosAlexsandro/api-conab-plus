"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/integrations/g4flex/queues/workOrder.worker.js

// Este arquivo define um worker que processa as ordens de serviço (OS) da fila 'workOrderQueue'.
// Ele atribui um técnico disponível à OS e atualiza o status da OS.
// Se não houver técnico disponível, a OS é reagendada para um tempo futuro.

var _bullmq = require('bullmq');
var _redis = require('./redis'); var _redis2 = _interopRequireDefault(_redis);
var _WorkOrderService = require('../services/WorkOrderService'); var _WorkOrderService2 = _interopRequireDefault(_WorkOrderService);
var _workOrderqueue = require('./workOrder.queue'); var _workOrderqueue2 = _interopRequireDefault(_workOrderqueue);
var _WhatsAppService = require('../services/WhatsAppService'); var _WhatsAppService2 = _interopRequireDefault(_WhatsAppService);
var _WorkOrderWaitingQueueService = require('../../../services/WorkOrderWaitingQueueService'); var _WorkOrderWaitingQueueService2 = _interopRequireDefault(_WorkOrderWaitingQueueService);

const RETRY_INTERVAL_MS = 1 * 60 * 1000;
const TIMEZONE_BRASILIA = 'America/Sao_Paulo';

// Function to generate date in Brazil timezone
function generateNextAttemptDate(delay) {
  const futureDate = new Date(Date.now() + delay);
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIMEZONE_BRASILIA,
    dateStyle: 'short',
    timeStyle: 'medium'
  }).format(futureDate);
}

const workOrderWorker = new (0, _bullmq.Worker)(
  "workOrderQueue",
  async (job) => {
    const jobType = job.name;

    // Processar com base no tipo de job
    if (jobType === "createWorkOrder") {
      return await processCreateWorkOrder(job);
    } else if (jobType === "assignTechnician") {
      return await processAssignTechnician(job);
    } else if (jobType === "processWorkOrderFeedback") {
      return await processWorkOrderFeedback(job);
    } else if (jobType === "cancelWorkOrder") {
      return await processCancelWorkOrder(job);
    } else {
      console.log(`❓ Tipo de job não reconhecido: ${jobType}`);
      throw new Error(`Tipo de job não reconhecido: ${jobType}`);
    }
  },
  {
    connection: _redis2.default,
  }
);

// Função para processar criação de ordem de serviço
async function processCreateWorkOrder(job) {
  console.log(`🔄 Processando criação de ordem de serviço para job #${job.id}`);

  const orderData = job.data;

  try {
    // Registrar na fila de espera que a ordem está sendo processada
    const queueResult = await _WorkOrderWaitingQueueService2.default.createInQueue({
      orderNumber: orderData.orderId || 'Em processamento',
      entityName: orderData.customerName,
      uraRequestId: orderData.uraRequestId,
      priority: orderData.priority || 'normal',
      source: 'g4flex'
    });

    // Se for uma solicitação duplicada, retornar o resultado do serviço
    if (!queueResult.success && queueResult.error === 'DUPLICATE_REQUEST') {
      console.warn(`⚠️ Solicitação duplicada detectada para uraRequestId: ${orderData.uraRequestId}`);
      return queueResult;
    }

    // Chamar o serviço para criar a ordem
    const result = await _WorkOrderService2.default.createWorkOrder(orderData);
    console.log(`✅ Ordem de serviço ${result.workOrder} criada com sucesso`);

    // Atualizar status na fila de espera
    await _WorkOrderWaitingQueueService2.default.updateQueueStatus(
      orderData.uraRequestId,
      result.workOrder,
      'WAITING_TECHNICIAN'
    );

    // Atualizar o número da ordem na fila de espera
    await _WorkOrderWaitingQueueService2.default.updateQueueOrderNumber(
      orderData.uraRequestId,
      result.workOrder
    );

    // Adicionar na fila de atribuição de técnico
    await _workOrderqueue2.default.add("assignTechnician", {
      orderId: result.workOrder,
      uraRequestId: orderData.uraRequestId
    });

    console.log(
      `📨 Ordem ${result.workOrder} adicionada à fila de atribuição de técnico`
    );

    return { success: true, workOrder: result.workOrder };
  } catch (error) {
    console.error(`❌ Erro ao criar ordem de serviço:`, error);

    // Registrar falha na fila de espera, se possível
    if (orderData.uraRequestId) {
      try {
        await _WorkOrderWaitingQueueService2.default.updateQueueStatus(
          orderData.uraRequestId,
          orderData.orderId,
          'FAILED'
        );
      } catch (queueError) {
        console.error('Erro ao atualizar status na fila de espera:', queueError);
      }
    }

    throw error;
  }
}

// Função para processar atribuição de técnico à ordem
async function processAssignTechnician(job) {
  const { orderId, uraRequestId } = job.data;
  console.log(`🔄 Processando atribuição de técnico para ordem ${orderId}`);

  try {
    // Garantir que temos um uraRequestId válido
    const validUraRequestId = uraRequestId;

    const orderStatus = await _WorkOrderService2.default.isOrderFulfilledORCancelled(orderId);

    if (orderStatus.isCancelled) {
      console.log(`⚠️ Ordem ${orderId} já foi cancelada`);
      await _WorkOrderWaitingQueueService2.default.updateQueueStatus(
        validUraRequestId,
        orderId,
        'CANCELED'
      );
      return { success: false, orderCancelled: true };
    } else if (orderStatus.isFulfilled) {
      console.log(`⚠️ Ordem ${orderId} já foi concluída`);
      await _WorkOrderWaitingQueueService2.default.updateQueueStatus(
        validUraRequestId,
        orderId,
        'FULFILLED'
      );
      return { success: false, orderFulfilled: true };
    }

    const result = await _WorkOrderService2.default.assignTechnicianToWorkOrder(
      orderId,
      validUraRequestId
    );

    // Verificar se não há técnicos disponíveis e reagendar
    if (result.noTechnician) {
      console.log(`⚠️ Sem técnicos disponíveis para ordem ${orderId}`);

      // Calcular próxima tentativa
      const delay = RETRY_INTERVAL_MS;
      const nextAttemptDate = generateNextAttemptDate(delay);

      await _workOrderqueue2.default.add("assignTechnician",
        {
          orderId,
          uraRequestId: validUraRequestId,
          retryCount: (job.data.retryCount || 0) + 1
        },
        {
          delay,
          removeOnComplete: false
        }
      );

      console.log(`📅 Reagendada nova tentativa para ordem ${orderId} em ${nextAttemptDate}`);
      return { ...result, rescheduled: true, nextAttempt: nextAttemptDate };
    }

    // Atualizar status na fila de espera
    await _WorkOrderWaitingQueueService2.default.updateQueueStatus(
      validUraRequestId,
      orderId,
      'WAITING_ARRIVAL'
    );

    // Registrar o técnico atribuído
    if (result.technicianId) {
      await _WorkOrderWaitingQueueService2.default.updateTechnicianAssigned(
        validUraRequestId,
        result.technicianName || result.technicianId
      );
      console.log(`✅ Técnico ${result.technicianName || result.technicianId} registrado para ordem ${orderId}`);
    }

    return result;
  } catch (error) {
    console.error(`❌ Erro ao atribuir técnico à ordem ${orderId}:`, error);

    // Registra a falha, mas reagenda para nova tentativa
    const delay = RETRY_INTERVAL_MS;
    const nextAttemptDate = generateNextAttemptDate(delay);
    const validUraRequestId = uraRequestId || `retry-${Date.now()}`;

    await _workOrderqueue2.default.add("assignTechnician",
      {
        orderId,
        uraRequestId: validUraRequestId,
        retryCount: (job.data.retryCount || 0) + 1
      },
      {
        delay,
        removeOnComplete: false
      }
    );

    console.log(`📅 Reagendada nova tentativa para ordem ${orderId} em ${nextAttemptDate}`);
    return { success: false, rescheduled: true, nextAttempt: nextAttemptDate };
  }
}

// Função para processar feedback de OS para a URA
async function processWorkOrderFeedback(job) {
  const {
    orderId = '',
    feedback = '',
    technicianName = '',
    technicianId = '',
    uraRequestId = '',
    requesterContact = '',
    customerName = ''
  } = job.data || {};
  console.log(`🔄 INIT Processando feedback de ordem ${orderId}, URA Request ID: ${uraRequestId}`);

  try {
    // Passar o objeto com os parâmetros nomeados conforme esperado pelo WhatsAppService
    const result = await _WhatsAppService2.default.sendWhatsAppMessage({
      phoneNumber: requesterContact,
      workOrderId: orderId,
      customerName: customerName,
      feedback: feedback,
      technicianName: technicianName,
      uraRequestId: uraRequestId
    });

    console.log(`✅ Feedback processado com sucesso para ordem ${orderId}`);
    return result;

  } catch (error) {
    console.error(`❌ Erro ao processar feedback de ordem ${orderId}:`, error);

    // Tentar novamente após um intervalo
    const delay = RETRY_INTERVAL_MS;
    const nextAttemptDate = generateNextAttemptDate(delay);

    await _workOrderqueue2.default.add("processWorkOrderFeedback",
      {
        orderId,
        feedback,
        technicianName,
        uraRequestId: uraRequestId,
        retryCount: (job.data.retryCount || 0) + 1
      },
      {
        delay,
        removeOnComplete: false
      }
    );

    console.log(`📅 Reagendado processamento de feedback para ordem ${orderId} em ${nextAttemptDate}`);
    return {
      success: false,
      error: error.message,
      rescheduled: true,
      nextAttempt: nextAttemptDate
    };
  }
}

// Função para processar cancelamento de ordem de serviço
async function processCancelWorkOrder(job) {
  const { identifierType, identifierValue, uraRequestId, cancellationRequesterInfo } = job.data;
  console.log(`🔄 Processando cancelamento de ordem para cliente ${identifierValue}`);

  try {
    const result = await _WorkOrderService2.default.closeWorkOrderByCustomerId({
      identifierType,
      identifierValue,
      uraRequestId,
      cancellationRequesterInfo
    });

    // Atualizar status na fila de espera para todas as ordens canceladas
    // TODO: Analisar se não é melhor atualizar considerando o número da OS, em vez do ID da URA.
    if (result.orders && result.orders.length > 0) {
      await Promise.all(result.orders.map(async (orderNumber) => {
        await _WorkOrderWaitingQueueService2.default.updateQueueStatus(
          uraRequestId,
          orderNumber,
          'CANCELED'
        );
      }));
    }

    console.log(`✅ Ordens canceladas com sucesso: ${result.orders.join(', ')}`);
    return result;

  } catch (error) {
    console.error(`❌ Erro ao cancelar ordens:`, error);

    // Registrar falha na fila de espera
    try {
      await _WorkOrderWaitingQueueService2.default.updateQueueStatus(
        uraRequestId,
        orderId,
        'FAILED'
      );
    } catch (queueError) {
      console.error('Erro ao atualizar status na fila de espera:', queueError);
    }

    throw error;
  }
}

exports. default = workOrderWorker;
