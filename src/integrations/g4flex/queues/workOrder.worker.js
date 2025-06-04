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
import technicianService from "../services/TechnicianService";

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
    } else if (jobType === "cancelWorkOrder") {
      return await processCancelWorkOrder(job);
    } else if (jobType === "processArrivalCheck") {
      return await processArrivalCheck(job);
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
    const queueResult = await WorkOrderWaitingQueueService.createInQueue({
      orderNumber: orderData.orderId || 'Em processamento',
      entityName: orderData.customerName,
      uraRequestId: orderData.uraRequestId,
      priority: orderData.priority || 'normal',
      source: 'g4flex',
      customerIdentifier: orderData.identifierValue,
      productId: orderData.productId,
      requesterNameAndPosition: orderData.requesterNameAndPosition,
      incidentAndReceiverName: orderData.incidentAndReceiverName,
      requesterContact: orderData.requesterContact,
    });

    // Se for uma solicitação duplicada, retornar o resultado do serviço
    if (!queueResult.success && queueResult.error === 'DUPLICATE_REQUEST') {
      console.warn(`⚠️ Solicitação duplicada detectada para uraRequestId: ${orderData.uraRequestId}`);
      return queueResult;
    }

    // Chamar o serviço para criar a ordem
    const result = await workOrderService.createWorkOrder(orderData);
    console.log(`✅ Ordem de serviço ${result.workOrder} criada com sucesso`);

    // Atualizar status na fila de espera
    await WorkOrderWaitingQueueService.updateQueueStatus(
      orderData.uraRequestId,
      result.workOrder,
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
      uraRequestId: orderData.uraRequestId,
      customerName: orderData.customerName,
      requesterContact: orderData.requesterContact
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
        await WorkOrderWaitingQueueService.updateQueueStatus(
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
  const { orderId, uraRequestId, customerName, requesterContact } = job.data;
  console.log(`🔄 Processando atribuição de técnico para ordem ${orderId}`);

  try {
    // ✅ VERIFICAÇÃO GLOBAL: Se ALGUMA ordem está sendo editada, pausar TODAS
    console.log(`🔍 Verificando se há alguma ordem sendo editada globalmente...`);
    const editingStatus = await WorkOrderWaitingQueueService.hasAnyOrderBeingEdited();

    if (editingStatus.hasEditing) {
      console.log(`🔒 PAUSA GLOBAL: Ordem ${editingStatus.orderNumber} está sendo editada por ${editingStatus.editedBy}`);
      console.log(`⏸️ Reagendando TODAS as ordens com status WAITING_TECHNICIAN...`);

      // ✅ REAGENDAR para nova tentativa (todas as ordens serão pausadas)
      const delay = RETRY_INTERVAL_MS; // 1 minuto
      const nextAttemptDate = generateNextAttemptDate(delay);

      await workOrderQueue.add("assignTechnician",
        {
          orderId,
          uraRequestId,
          customerName,
          requesterContact,
          retryCount: (job.data.retryCount || 0) + 1,
          skippedDueToGlobalEditing: true,
          editingOrder: editingStatus.orderNumber,
          editedBy: editingStatus.editedBy
        },
        {
          delay,
          removeOnComplete: false
        }
      );

      console.log(`📅 Ordem ${orderId} reagendada para ${nextAttemptDate} - pausa global (${editingStatus.orderNumber} em edição)`);
      
      return {
        success: false,
        skipped: true,
        rescheduled: true,
        reason: 'Global editing pause - another order is being edited',
        message: `Todas as atribuições pausadas - ordem ${editingStatus.orderNumber} sendo editada por ${editingStatus.editedBy}`,
        nextAttempt: nextAttemptDate,
        editingOrder: editingStatus.orderNumber,
        editedBy: editingStatus.editedBy
      };
    }

    console.log(`✅ Nenhuma edição ativa detectada - processamento pode continuar`);

    // Verificar se há um técnico disponível antes de continuar
    const technician = await technicianService.getAvailableTechnician();

    if (!technician) {
      console.log(`⚠️ Sem técnicos disponíveis no momento`);

      // Reagendar para nova tentativa
      const delay = RETRY_INTERVAL_MS;
      const nextAttemptDate = generateNextAttemptDate(delay);

      await workOrderQueue.add("assignTechnician",
        {
          orderId,
          uraRequestId,
          customerName,
          requesterContact,
          retryCount: (job.data.retryCount || 0) + 1
        },
        {
          delay,
          removeOnComplete: false
        }
      );

      console.log(`📅 Reagendada nova tentativa para ordem ${orderId} em ${nextAttemptDate}`);
      return { success: false, noTechnician: true, rescheduled: true, nextAttempt: nextAttemptDate };
    }

    // Se temos um técnico disponível, buscar a ordem mais antiga aguardando atribuição
    const oldestOrder = await WorkOrderWaitingQueueService.findOldestWaitingOrder();

    // Se não há nenhuma ordem aguardando, usar a ordem atual
    if (!oldestOrder) {
      console.log(`⚠️ Nenhuma ordem aguardando atribuição. Verificando a ordem atual ${orderId}`);

      // Verificar se a ordem atual está aguardando técnico
      const currentOrder = await WorkOrderWaitingQueueService.findByOrderNumber(orderId);

      if (!currentOrder || currentOrder.status !== 'WAITING_TECHNICIAN') {
        console.log(`⚠️ Ordem atual ${orderId} não está aguardando técnico ou não existe`);
        return { success: false, message: 'Ordem não está aguardando técnico' };
      }

      // Usar a ordem atual se ela estiver aguardando técnico
      const validUraRequestId = currentOrder.uraRequestId || uraRequestId;
      const orderStatus = await workOrderService.isOrderFulfilledORCancelled(orderId);

      if (orderStatus.isCancelled) {
        console.log(`⚠️ Ordem ${orderId} já foi cancelada`);
        await WorkOrderWaitingQueueService.updateQueueStatus(
          validUraRequestId,
          orderId,
          'CANCELED'
        );
        return { success: false, orderCancelled: true };
      } else if (orderStatus.isFulfilled) {
        console.log(`⚠️ Ordem ${orderId} já foi concluída`);
        await WorkOrderWaitingQueueService.updateQueueStatus(
          validUraRequestId,
          orderId,
          'FULFILLED'
        );
        return { success: false, orderFulfilled: true };
      }

      // Processar a ordem atual
      const result = await workOrderService.assignTechnicianToWorkOrder(
        orderId,
        validUraRequestId,
        customerName,
        requesterContact
      );

      // Atualizar status na fila de espera
      await WorkOrderWaitingQueueService.updateQueueStatus(
        validUraRequestId,
        orderId,
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

      // Adicionar na fila de verificação de chegada no cliente
      await workOrderQueue.add("processArrivalCheck", {
        orderId,
        uraRequestId: validUraRequestId,
        technicianName: result.technicianName || result.technicianId
      }, {
        delay: 1 * 60 * 1000, // 1 minuto de delay
        removeOnComplete: false
      });

      console.log(`📅 Verificação de chegada agendada para ordem ${orderId} em 1 minuto`);

      return result;
    } else {
      // Usar a ordem mais antiga
      const oldestOrderId = oldestOrder.orderNumber;
      const oldestUraRequestId = oldestOrder.uraRequestId;
      const oldestCustomerName = oldestOrder.entityName;
      const oldestRequesterContact = oldestOrder.requesterContact;

      console.log(`🕒 Encontrada ordem mais antiga aguardando técnico: ${oldestOrderId}`);

      const orderStatus = await workOrderService.isOrderFulfilledORCancelled(oldestOrderId);

      if (orderStatus.isCancelled) {
        // Tentar novamente com outra ordem
        return processAssignTechnician(job);
      } else if (orderStatus.isFulfilled) {
        console.log(`⚠️ Ordem ${oldestOrderId} já foi concluída`);
        await WorkOrderWaitingQueueService.updateQueueStatus(
          oldestUraRequestId,
          oldestOrderId,
          'FULFILLED'
        );
        // Tentar novamente com outra ordem
        return processAssignTechnician(job);
      }

      // Processar a ordem mais antiga
      const result = await workOrderService.assignTechnicianToWorkOrder(
        oldestOrderId,
        oldestUraRequestId,
        oldestCustomerName,
        oldestRequesterContact
      );

      // Atualizar status na fila de espera
      await WorkOrderWaitingQueueService.updateQueueStatus(
        oldestUraRequestId,
        oldestOrderId,
        'WAITING_ARRIVAL'
      );

      // Registrar o técnico atribuído
      if (result.technicianId) {
        await WorkOrderWaitingQueueService.updateTechnicianAssigned(
          oldestUraRequestId,
          result.technicianName || result.technicianId
        );
        console.log(`✅ Técnico ${result.technicianName || result.technicianId} registrado para ordem ${oldestOrderId}`);
      }

      // Adicionar na fila de verificação de chegada no cliente
      await workOrderQueue.add("processArrivalCheck", {
        orderId: oldestOrderId,
        uraRequestId: oldestUraRequestId,
        technicianName: result.technicianName || result.technicianId
      }, {
        delay: 1 * 60 * 1000, // 1 minuto de delay
        removeOnComplete: false
      });

      console.log(`📅 Verificação de chegada agendada para ordem ${oldestOrderId} em 1 minuto`);

      // Reagendar a ordem atual se ela não foi a processada
      if (orderId !== oldestOrderId) {
        console.log(`📝 Ordem atual ${orderId} não foi processada pois não era a mais antiga`);
      }

      return {
        ...result,
        prioritizedOrder: {
          oldOrderId: oldestOrderId,
          originalOrderId: orderId
        },
        message: `Ordem mais antiga ${oldestOrderId} foi priorizada${orderId !== oldestOrderId ? ` sobre a ordem atual ${orderId}` : ''}`
      };
    }

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
        customerName,
        requesterContact,
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
    const result = await WhatsAppService.sendWhatsAppMessage({
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

    await workOrderQueue.add("processWorkOrderFeedback",
      {
        orderId,
        feedback,
        technicianName,
        technicianId,
        uraRequestId: uraRequestId,
        requesterContact,
        customerName,
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
    const result = await workOrderService.closeWorkOrderByCustomerId({
      identifierType,
      identifierValue,
      uraRequestId,
      cancellationRequesterInfo
    });

    // Atualizar status na fila de espera para todas as ordens canceladas
    if (result.orders && result.orders.length > 0) {
      await Promise.all(result.orders.map(async (orderNumber) => {
        await WorkOrderWaitingQueueService.updateQueueStatus(
          uraRequestId,
          orderNumber,
          'CANCELED'
        );
      }));

      // Enviar feedback WhatsApp de cancelamento para cada ordem cancelada
      try {
        await Promise.all(result.orders.map(async (orderNumber) => {
          // Buscar dados da ordem ORIGINAL pelo orderNumber, não pelo uraRequestId de cancelamento
          const queueData = await WorkOrderWaitingQueueService.findByOrderNumber(orderNumber);
          const customerName = queueData?.entityName;
          const phoneNumber = queueData?.requesterContact;

          if (phoneNumber && customerName) {
            await WhatsAppService.sendWhatsAppMessage({
              phoneNumber: phoneNumber,
              workOrderId: orderNumber,
              customerName: customerName,
              feedback: 'order_cancelled',
              uraRequestId: uraRequestId
            });
            console.log(`📱 Feedback de cancelamento enviado via WhatsApp para ${customerName} - ${phoneNumber} (ordem: ${orderNumber})`);
          } else {
            console.log(`⚠️ Não foi possível enviar feedback de cancelamento para ordem ${orderNumber}: dados insuficientes (nome: ${customerName}, telefone: ${phoneNumber})`);
          }
        }));
      } catch (feedbackError) {
        console.error('❌ Erro ao enviar feedback de cancelamento via WhatsApp:', feedbackError);
      }

      console.log(`✅ Ordens canceladas com sucesso: ${result.orders.join(', ')}`);
    } else {
      console.log(`ℹ️ Nenhuma ordem encontrada para cancelar para o cliente ${identifierValue}`);
    }

    return result;

  } catch (error) {
    console.error(`❌ Erro ao cancelar ordens:`, error);

    // Tentar encontrar ID da ordem para registrar falha, se possível
    try {
      // Verificar se o erro aconteceu em uma ordem específica
      const orderId = error.orderId || null;

      if (orderId) {
        await WorkOrderWaitingQueueService.updateQueueStatus(
          uraRequestId,
          orderId,
          'FAILED'
        );
      } else {
        console.warn('⚠️ Não foi possível determinar a ordem específica para registrar falha');
      }
    } catch (queueError) {
      console.error('Erro ao atualizar status na fila de espera:', queueError);
    }

    // Re-lançar o erro para permitir que o BullMQ trate conforme configurado
    throw error;
  }
}

// Função para processar verificação de chegada no cliente
async function processArrivalCheck(job) {
  const { orderId, uraRequestId, technicianName, retryCount = 0 } = job.data;
  console.log(`🔄 Processando verificação de chegada para ordem ${orderId} - Técnico: ${technicianName}`);

  try {
    // Garantir que temos um uraRequestId válido
    const validUraRequestId = uraRequestId;

    // Verificar se a ordem foi cancelada ou concluída
    const orderStatus = await workOrderService.isOrderFulfilledORCancelled(orderId);

    if (orderStatus.isCancelled) {
      console.log(`⚠️ Ordem ${orderId} já foi cancelada`);
      await WorkOrderWaitingQueueService.updateQueueStatus(
        validUraRequestId,
        orderId,
        'CANCELED'
      );
      return { success: false, orderCancelled: true };
    } else if (orderStatus.isFulfilled) {
      console.log(`✅ Ordem ${orderId} já foi concluída`);
      await WorkOrderWaitingQueueService.updateQueueStatus(
        validUraRequestId,
        orderId,
        'FINISHED'
      );
      return { success: true, orderCompleted: true };
    }

    // Reagendar próxima verificação em 1 minuto (até que caia em um dos ifs)
    await workOrderQueue.add("processArrivalCheck", {
      orderId,
      uraRequestId: validUraRequestId,
      technicianName,
      retryCount: retryCount + 1
    }, {
      delay: 2 * 60 * 1000, // 1 minuto
      removeOnComplete: false
    });

    console.log(`📅 Próxima verificação agendada para ordem ${orderId} em 2 minutos`);

    return {
      success: true,
      message: `Verificação ${retryCount + 1} concluída para ordem ${orderId}`,
      nextCheck: '1_minute'
    };

  } catch (error) {
    console.error(`❌ Erro ao verificar ordem ${orderId}:`, error);

    // Reagendar verificação em caso de erro
    const delay = 2 * 60 * 1000; // 2 minutos
    const nextAttemptDate = generateNextAttemptDate(delay);
    const validUraRequestId = uraRequestId || `retry-arrival-${Date.now()}`;

    await workOrderQueue.add("processArrivalCheck",
      {
        orderId,
        uraRequestId: validUraRequestId,
        technicianName,
        retryCount: (job.data.retryCount || 0) + 1
      },
      {
        delay,
        removeOnComplete: false
      }
    );

    console.log(`📅 Reagendada verificação para ordem ${orderId} em ${nextAttemptDate} devido a erro`);
    return { success: false, rescheduled: true, nextAttempt: nextAttemptDate };
  }
}

export default workOrderWorker;
