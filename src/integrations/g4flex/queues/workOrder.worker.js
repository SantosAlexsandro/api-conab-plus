// src/integrations/g4flex/queues/workOrder.worker.js

// Este arquivo define um worker que processa as ordens de serviço (OS) da fila 'workOrderQueue'.
// Ele atribui um técnico disponível à OS e atualiza o status da OS.
// Se não houver técnico disponível, a OS é reagendada para um tempo futuro.

import { Worker } from "bullmq";
import redisConnection from "./redis";
import workOrderService from "../services/WorkOrderService";
import workOrderQueue from "./workOrder.queue";
import WhatsAppService from "../services/WhatsAppService";
import WorkOrderWaitingQueueService from "../../../services/WorkOrderWaitingQueueService";

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

const workOrderWorker = new Worker(
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
    connection: redisConnection,
  }
);

// Função para processar criação de ordem de serviço
async function processCreateWorkOrder(job) {
  console.log(`🔄 Processando criação de ordem de serviço para job #${job.id}`);
  const orderData = job.data;

  try {
    // Registrar na fila de espera que a ordem está sendo processada
    await WorkOrderWaitingQueueService.createInQueue({
      orderNumber: orderData.orderId || 'Em processamento',
      entityName: orderData.customerName,
      uraRequestId: orderData.uraRequestId,
      priority: orderData.priority || 'normal', // TODO: Criar método para definir prioridade
      source: 'g4flex'
    });

    // Chamar o serviço para criar a ordem
    const result = await workOrderService.createWorkOrder(orderData);
    console.log(`✅ Ordem de serviço ${result.workOrder} criada com sucesso`);

    // Atualizar status na fila de espera
    await WorkOrderWaitingQueueService.updateQueueStatus(
      orderData.uraRequestId,
      'WAITING_TECHNICIAN'
    );

    // Atualizar o número da ordem na fila de espera
    await WorkOrderWaitingQueueService.updateQueueOrderNumber(
      orderData.uraRequestId,
      result.workOrder
    );

    // Adicionar na fila de atribuição de técnico
    await workOrderQueue.add("assignTechnician", {
      orderId: result.workOrder,
      uraRequestId: orderData.uraRequestId
    });
    // TODO: Adicionar na fila Ordens geradas manualmente.
    console.log(
      `📨 Ordem ${result.workOrder} adicionada à fila de atribuição de técnico`
    );

    return { success: true, workOrder: result.workOrder };
  } catch (error) {
    console.error(`❌ Erro ao criar ordem de serviço:`, error);

    // Registrar falha na fila de espera, se possível
    if (orderData.uraRequestId) {
      try {
        await WorkOrderWaitingQueueService.updateQueueStatus(
          orderData.uraRequestId,
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

    const orderStatus = await workOrderService.isOrderFulfilledORCancelled(orderId);

    if (orderStatus.isCancelled) {
      console.log(`⚠️ Ordem ${orderId} já foi cancelada`);
      await WorkOrderWaitingQueueService.updateQueueStatus(
        validUraRequestId,
        'CANCELED'
      );
      return { success: false, orderCancelled: true };
    } else if (orderStatus.isFulfilled) {
      console.log(`⚠️ Ordem ${orderId} já foi concluída`);
      await WorkOrderWaitingQueueService.updateQueueStatus(
        validUraRequestId,
        'FULFILLED'
      );
      return { success: false, orderFulfilled: true };
    }

    const result = await workOrderService.assignTechnicianToWorkOrder(
      orderId,
      validUraRequestId
    );

    // Verificar se não há técnicos disponíveis e reagendar
    if (result.noTechnician) {
      console.log(`⚠️ Sem técnicos disponíveis para ordem ${orderId}`);

      // Calcular próxima tentativa
      const delay = RETRY_INTERVAL_MS;
      const nextAttemptDate = generateNextAttemptDate(delay);

      await workOrderQueue.add("assignTechnician",
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
    await WorkOrderWaitingQueueService.updateQueueStatus(
      validUraRequestId,
      'WAITING_ARRIVAL'
    );

    // Registrar o técnico atribuído
    if (result.technicianId) {
      await WorkOrderWaitingQueueService.updateTechnicianAssigned(
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

    await workOrderQueue.add("assignTechnician",
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
  const { orderId, feedback, technicianName, uraRequestId, requesterContact, customerName } = job.data;

  // Garantir que uraRequestId tenha um valor válido (nunca nulo)
  const validUraRequestId = uraRequestId || `auto-feedback-${Date.now()}`;

  console.log(`🔄 Processando feedback de ordem ${orderId}, URA Request ID: ${validUraRequestId}`);

  try {
    // Passar o objeto com os parâmetros nomeados conforme esperado pelo WhatsAppService
    const result = await WhatsAppService.sendWhatsAppMessage({
      phoneNumber: requesterContact,
      workOrderId: orderId,
      customerName: customerName
    });

    // Atualizar status na fila de espera
    /*if (result.success) {
      await WorkOrderWaitingQueueService.updateQueueStatus(
        validUraRequestId,
        'IN_PROGRESS'
      );
    }*/

    console.log(`✅ Feedback processado com sucesso para ordem ${orderId}`);
    return result;
  } catch (error) {
    console.error(`❌ Erro ao processar feedback de ordem ${orderId}:`, error);

    // Tentar novamente após um intervalo
    const delay = RETRY_INTERVAL_MS;
    const nextAttemptDate = generateNextAttemptDate(delay);

    await workOrderQueue.add("processWorkOrderFeedback",
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

export default workOrderWorker;
