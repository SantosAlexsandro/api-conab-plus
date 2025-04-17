"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/integrations/g4flex/queues/workOrder.worker.js

// Este arquivo define um worker que processa as ordens de serviço (OS) da fila 'workOrderQueue'.
// Ele atribui um técnico disponível à OS e atualiza o status da OS.
// Se não houver técnico disponível, a OS é reagendada para um tempo futuro.

var _bullmq = require('bullmq');
var _redis = require('./redis'); var _redis2 = _interopRequireDefault(_redis);
var _TechnicianService = require('../services/TechnicianService'); var _TechnicianService2 = _interopRequireDefault(_TechnicianService);
var _WorkOrderService = require('../services/WorkOrderService'); var _WorkOrderService2 = _interopRequireDefault(_WorkOrderService);
var _workOrderqueue = require('./workOrder.queue'); var _workOrderqueue2 = _interopRequireDefault(_workOrderqueue);

const INTERVALO_REPROCESSAMENTO_MS = 5 * 60 * 1000;


const workOrderWorker = new (0, _bullmq.Worker)('workOrderQueue', async (job) => {
  const jobType = job.name;

  // Processar com base no tipo de job
  if (jobType === 'createWorkOrder') {
    return await processCreateWorkOrder(job);
  } else if (jobType === 'assignTechnician') {
    return await processAssignTechnician(job);
  } else {
    console.log(`❓ Tipo de job não reconhecido: ${jobType}`);
    throw new Error(`Tipo de job não reconhecido: ${jobType}`);
  }
}, {
  connection: _redis2.default,
});

// Função para processar criação de ordem de serviço
async function processCreateWorkOrder(job) {
  console.log(`🔄 Processando criação de ordem de serviço para job #${job.id}`);
  const orderData = job.data;

  try {
    // Chamar o serviço para criar a ordem
    const result = await _WorkOrderService2.default.createWorkOrder(orderData);
    console.log(`✅ Ordem de serviço ${result.workOrder} criada com sucesso`);

    // Adicionar na fila de atribuição de técnico
    await _workOrderqueue2.default.add('assignTechnician', {
      orderId: result.workOrder
    });
    console.log(`📨 Ordem ${result.workOrder} adicionada à fila de atribuição de técnico`);

    return { success: true, workOrder: result.workOrder };
  } catch (error) {
    console.error(`❌ Erro ao criar ordem de serviço:`, error);
    throw error;
  }
}

// Função para processar atribuição de técnico à ordem
async function processAssignTechnician(job) {
  const { orderId } = job.data;
  console.log(`🔄 Processando atribuição de técnico para ordem ${orderId}`);

  try {
    const technician = await _TechnicianService2.default.getAvailableTechnician();

    if (technician) {
      await _WorkOrderService2.default.assignTechnicianToWorkOrder(orderId, technician.id);
      console.log(`✅ Técnico atribuído à ordem ${orderId}`);
      return { success: true, orderId, technicianId: technician.id };
    } else {
      console.log(`⏳ Sem técnico disponível. Reagendando ordem ${orderId}`);
      // Adiciona um novo job na fila em vez de mover o atual
      await _workOrderqueue2.default.add('assignTechnician', { orderId }, {
        delay: INTERVALO_REPROCESSAMENTO_MS,
        removeOnComplete: false
      });
      console.log(`🕒 Ordem ${orderId} reagendada para processamento futuro`);

      // Criar data no fuso horário de Brasília (GMT-3)
      const nextAttemptDate = new Date(Date.now() + INTERVALO_REPROCESSAMENTO_MS);
      // Formatar a data como string no fuso horário de Brasília
      const brasiliaTime = nextAttemptDate.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/, '$3-$2-$1T$4:$5:$6');

      return {
        success: false,
        rescheduled: true,
        nextAttempt: brasiliaTime
      };
    }
  } catch (error) {
    console.error(`❌ Erro ao atribuir técnico à ordem ${orderId}:`, error);
    throw error;
  }
}

exports. default = workOrderWorker;
