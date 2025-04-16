"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/integrations/g4flex/queues/workOrder.worker.js

// Este arquivo define um worker que processa as ordens de serviço (OS) da fila 'workOrderQueue'.
// Ele atribui um técnico disponível à OS e atualiza o status da OS.
// Se não houver técnico disponível, a OS é reagendada para um tempo futuro.

var _bullmq = require('bullmq');
var _redis = require('./redis'); var _redis2 = _interopRequireDefault(_redis);
var _TechnicianService = require('../services/TechnicianService');
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
    const technician = await _TechnicianService.getAvailableTechnician.call(void 0, );

    if (technician) {
      await _TechnicianService.assignTechnician.call(void 0, orderId, technician.id);
      await _WorkOrderService2.default.updateWorkOrderStatus(orderId, 'ATRIBUIDA');
      console.log(`✅ Técnico atribuído à ordem ${orderId}`);
      return { success: true, orderId, technicianId: technician.id };
    } else {
      console.log(`⏳ Sem técnico disponível. Reagendando ordem ${orderId}`);
      await job.moveToDelayed(Date.now() + INTERVALO_REPROCESSAMENTO_MS);
      return { success: false, rescheduled: true };
    }
  } catch (error) {
    console.error(`❌ Erro ao atribuir técnico à ordem ${orderId}:`, error);
    throw error;
  }
}

exports. default = workOrderWorker;
