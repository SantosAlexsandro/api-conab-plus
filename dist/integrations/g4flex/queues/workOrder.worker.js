"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/integrations/g4flex/queues/workOrder.worker.js

// Este arquivo define um worker que processa as ordens de serviço (OS) da fila 'workOrderQueue'.
// Ele atribui um técnico disponível à OS e atualiza o status da OS.
// Se não houver técnico disponível, a OS é reagendada para um tempo futuro.

var _bullmq = require('bullmq');
var _redis = require('./redis'); var _redis2 = _interopRequireDefault(_redis);
var _WorkOrderService = require('../services/WorkOrderService'); var _WorkOrderService2 = _interopRequireDefault(_WorkOrderService);
var _workOrderqueue = require('./workOrder.queue'); var _workOrderqueue2 = _interopRequireDefault(_workOrderqueue);
var _WebhookService = require('../services/WebhookService'); var _WebhookService2 = _interopRequireDefault(_WebhookService);

const RETRY_INTERVAL_MS = 3 * 60 * 1000;
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
    // Chamar o serviço para criar a ordem
    const result = await _WorkOrderService2.default.createWorkOrder(orderData);
    console.log(`✅ Ordem de serviço ${result.workOrder} criada com sucesso`);

    // Adicionar na fila de atribuição de técnico
    await _workOrderqueue2.default.add("assignTechnician", {
      orderId: result.workOrder,
    });
    // TODO: Adicionar na fila Ordens geradas manualmente.
    console.log(
      `📨 Ordem ${result.workOrder} adicionada à fila de atribuição de técnico`
    );

    return { success: true, workOrder: result.workOrder };
  } catch (error) {
    console.error(`❌ Erro ao criar ordem de serviço:`, error);
    throw error;
  }
}

// Função para processar atribuição de técnico à ordem
async function processAssignTechnician(job) {
  const { orderId, uraRequestId } = job.data;
  console.log(`🔄 Processando atribuição de técnico para ordem ${orderId}`);

  try {
    const result = await _WorkOrderService2.default.assignTechnicianToWorkOrder(
      orderId,
      uraRequestId || `auto-${Date.now()}`
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
          uraRequestId: uraRequestId || `no-tech-retry-${Date.now()}`,
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

    return result;
  } catch (error) {
    console.error(`❌ Erro ao atribuir técnico à ordem ${orderId}:`, error);

    // Registra a falha, mas reagenda para nova tentativa
    const delay = RETRY_INTERVAL_MS;
    const nextAttemptDate = generateNextAttemptDate(delay);

    await _workOrderqueue2.default.add("assignTechnician",
      {
        orderId,
        uraRequestId: uraRequestId || `retry-${Date.now()}`,
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
  const { orderId, feedback, technicianName, uraRequestId } = job.data;

  // Garantir que uraRequestId tenha um valor válido (nunca nulo)
  const validUraRequestId = uraRequestId || `auto-feedback-${Date.now()}`;

  console.log(`🔄 Processando feedback de ordem ${orderId}, URA Request ID: ${validUraRequestId}`);

  try {
    // Passar o objeto com os parâmetros nomeados conforme esperado pelo WebhookService
    const result = await _WebhookService2.default.notifyWorkOrderCreated({
      workOrderId: orderId,
      technicianName: technicianName || 'Não atribuído',
      uraRequestId: validUraRequestId
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
        uraRequestId: validUraRequestId,
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

exports. default = workOrderWorker;
