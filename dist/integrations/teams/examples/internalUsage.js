"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }/*
 * EXEMPLOS DE USO INTERNO - INTEGRAÇÃO TEAMS
 *
 * Este arquivo contém exemplos práticos de como usar a integração Teams
 * internamente na aplicação, sem necessidade de rotas HTTP.
 */

var _TeamsAuthService = require('../services/TeamsAuthService'); var _TeamsAuthService2 = _interopRequireDefault(_TeamsAuthService);
var _TeamsService = require('../services/TeamsService'); var _TeamsService2 = _interopRequireDefault(_TeamsService);
var _teamsHelpers = require('../utils/teamsHelpers');

// Exemplo 1: Notificar técnico sobre nova ordem de serviço
 async function notifyTechnicianWorkOrder(workOrder, technicianUserId, supervisorUserId) {
  try {
    // Verificar se técnico está autenticado no Teams
    if (!_TeamsAuthService2.default.isUserAuthenticated(technicianUserId)) {
      console.log(`Técnico ${technicianUserId} não está autenticado no Teams`);
      return false;
    }

    // Buscar chats do supervisor
    const chats = await _TeamsService2.default.getUserChats(supervisorUserId);

    // Procurar chat existente com o técnico
    let targetChat = chats.find(chat =>
      chat.members && chat.members.some(member => member.userId === technicianUserId)
    );

    // Se não encontrar chat, criar novo
    if (!targetChat) {
      targetChat = await _TeamsService2.default.createChat(
        supervisorUserId,
        [{ id: technicianUserId }],
        'oneOnOne'
      );
    }

    // Formatar mensagem
    const message = _teamsHelpers.formatHTMLMessage.call(void 0, 
      `🔧 Nova Ordem de Serviço #${workOrder.number}\n` +
      `📍 Local: ${workOrder.location}\n` +
      `⏰ Prazo: ${workOrder.dueDate}\n` +
      `📝 Descrição: ${workOrder.description}`,
      { bold: true }
    );

    // Enviar mensagem
    await _TeamsService2.default.sendMessageToChat(
      supervisorUserId,
      targetChat.id,
      message,
      'html'
    );

    console.log(`Notificação Teams enviada para técnico ${technicianUserId}`);
    return true;

  } catch (error) {
    console.error('Erro ao notificar via Teams:', error.message);
    return false;
  }
} exports.notifyTechnicianWorkOrder = notifyTechnicianWorkOrder;

// Exemplo 2: Notificar finalização de ordem de serviço
 async function notifyWorkOrderCompletion(workOrder, supervisorUserId) {
  try {
    if (!_TeamsAuthService2.default.isUserAuthenticated(supervisorUserId)) {
      return false;
    }

    // Criar notificação de atividade
    await _TeamsService2.default.sendActivityNotification(
      supervisorUserId,
      supervisorUserId, // Notificar o próprio supervisor
      `Ordem de Serviço #${workOrder.number} Finalizada`,
      'workOrderCompleted',
      {
        previewText: `OS #${workOrder.number} foi concluída com sucesso`,
        workOrderNumber: workOrder.number,
        completedBy: workOrder.completedBy,
        completedAt: new Date().toLocaleString('pt-BR'),
        rating: workOrder.rating || 'N/A'
      }
    );

    return true;
  } catch (error) {
    console.error('Erro ao notificar conclusão:', error.message);
    return false;
  }
} exports.notifyWorkOrderCompletion = notifyWorkOrderCompletion;

// Exemplo 3: Enviar lembrete de ordem pendente
 async function sendPendingOrderReminder(pendingOrders, technicianUserId, supervisorUserId) {
  try {
    if (!_TeamsAuthService2.default.isUserAuthenticated(technicianUserId) ||
        !_TeamsAuthService2.default.isUserAuthenticated(supervisorUserId)) {
      return false;
    }

    if (pendingOrders.length === 0) {
      return true; // Nada para notificar
    }

    // Criar mensagem com lista de ordens pendentes
    let message = '⏰ **Lembrete: Ordens de Serviço Pendentes**\n\n';

    pendingOrders.forEach(order => {
      message += `🔧 **OS #${order.number}**\n`;
      message += `📍 ${order.location}\n`;
      message += `⏱️ Prazo: ${order.dueDate}\n`;
      message += `🚨 Prioridade: ${order.priority}\n\n`;
    });

    message += `📊 Total: ${pendingOrders.length} ordem(s) pendente(s)`;

    // Buscar chat entre supervisor e técnico
    const chats = await _TeamsService2.default.getUserChats(supervisorUserId);
    const targetChat = chats.find(chat =>
      chat.members && chat.members.some(member => member.userId === technicianUserId)
    );

    if (targetChat) {
      await _TeamsService2.default.sendMessageToChat(
        supervisorUserId,
        targetChat.id,
        message,
        'text'
      );
    }

    return true;
  } catch (error) {
    console.error('Erro ao enviar lembrete:', error.message);
    return false;
  }
} exports.sendPendingOrderReminder = sendPendingOrderReminder;

// Exemplo 4: Integração com sistema de turnos
 async function notifyShiftChange(shiftInfo, teamMembers, supervisorUserId) {
  try {
    if (!_TeamsAuthService2.default.isUserAuthenticated(supervisorUserId)) {
      return false;
    }

    // Criar chat em grupo para o turno
    const chatParticipants = teamMembers.map(member => ({ id: member.userId }));

    const groupChat = await _TeamsService2.default.createChat(
      supervisorUserId,
      chatParticipants,
      'group',
      `Turno ${shiftInfo.shiftName} - ${shiftInfo.date}`
    );

    // Mensagem de início de turno
    const welcomeMessage = _teamsHelpers.formatHTMLMessage.call(void 0, 
      `🚀 **Início do Turno ${shiftInfo.shiftName}**\n\n` +
      `📅 Data: ${shiftInfo.date}\n` +
      `⏰ Horário: ${shiftInfo.startTime} às ${shiftInfo.endTime}\n` +
      `👥 Equipe: ${teamMembers.map(m => m.name).join(', ')}\n\n` +
      `📋 Ordens programadas: ${shiftInfo.scheduledOrders}\n` +
      `🎯 Meta do dia: ${shiftInfo.dailyGoal}`,
      { bold: true }
    );

    await _TeamsService2.default.sendMessageToChat(
      supervisorUserId,
      groupChat.id,
      welcomeMessage,
      'html'
    );

    return { success: true, chatId: groupChat.id };
  } catch (error) {
    console.error('Erro ao notificar mudança de turno:', error.message);
    return { success: false, error: error.message };
  }
} exports.notifyShiftChange = notifyShiftChange;

// Exemplo 5: Status de emergência
 async function sendEmergencyAlert(emergencyInfo, allTeamUserIds, supervisorUserId) {
  try {
    if (!_TeamsAuthService2.default.isUserAuthenticated(supervisorUserId)) {
      return false;
    }

    const emergencyMessage = _teamsHelpers.formatHTMLMessage.call(void 0, 
      `🚨 **ALERTA DE EMERGÊNCIA** 🚨\n\n` +
      `📍 Local: ${emergencyInfo.location}\n` +
      `🆘 Tipo: ${emergencyInfo.type}\n` +
      `📝 Descrição: ${emergencyInfo.description}\n` +
      `⏰ Horário: ${new Date().toLocaleString('pt-BR')}\n\n` +
      `👨‍🔧 Técnico mais próximo deve responder IMEDIATAMENTE!`,
      { bold: true, color: '#FF0000' }
    );

    // Enviar para todos os técnicos individualmente
    const sendPromises = allTeamUserIds.map(async (technicianId) => {
      try {
        if (!_TeamsAuthService2.default.isUserAuthenticated(technicianId)) {
          return { technicianId, success: false, reason: 'not_authenticated' };
        }

        // Buscar ou criar chat individual
        const chats = await _TeamsService2.default.getUserChats(supervisorUserId);
        let targetChat = chats.find(chat =>
          chat.members && chat.members.some(member => member.userId === technicianId)
        );

        if (!targetChat) {
          targetChat = await _TeamsService2.default.createChat(
            supervisorUserId,
            [{ id: technicianId }],
            'oneOnOne'
          );
        }

        await _TeamsService2.default.sendMessageToChat(
          supervisorUserId,
          targetChat.id,
          emergencyMessage,
          'html'
        );

        return { technicianId, success: true };
      } catch (error) {
        return { technicianId, success: false, reason: error.message };
      }
    });

    const results = await Promise.allSettled(sendPromises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;

    console.log(`Alerta de emergência enviado para ${successCount}/${allTeamUserIds.length} técnicos`);
    return { totalSent: successCount, totalTeam: allTeamUserIds.length };

  } catch (error) {
    console.error('Erro ao enviar alerta de emergência:', error.message);
    return false;
  }
} exports.sendEmergencyAlert = sendEmergencyAlert;

// Exemplo 6: Relatório diário automático
 async function sendDailyReport(reportData, managementUserIds, supervisorUserId) {
  try {
    if (!_TeamsAuthService2.default.isUserAuthenticated(supervisorUserId)) {
      return false;
    }

    const reportMessage = _teamsHelpers.formatHTMLMessage.call(void 0, 
      `📊 **Relatório Diário - ${reportData.date}**\n\n` +
      `✅ Ordens Concluídas: ${reportData.completedOrders}\n` +
      `⏳ Ordens Pendentes: ${reportData.pendingOrders}\n` +
      `🚨 Ordens Atrasadas: ${reportData.overdueOrders}\n` +
      `👥 Técnicos Ativos: ${reportData.activeTechnicians}\n` +
      `⭐ Avaliação Média: ${reportData.averageRating}/5\n` +
      `⏱️ Tempo Médio por OS: ${reportData.averageTime}h\n\n` +
      `🎯 Meta Diária: ${reportData.dailyGoalPercentage}% atingida`,
      { bold: true }
    );

    // Enviar para gerência
    for (const managerId of managementUserIds) {
      try {
        if (_TeamsAuthService2.default.isUserAuthenticated(managerId)) {
          await _TeamsService2.default.sendActivityNotification(
            supervisorUserId,
            managerId,
            'Relatório Diário Disponível',
            'dailyReport',
            {
              previewText: `Relatório do dia ${reportData.date}`,
              ...reportData
            }
          );
        }
      } catch (error) {
        console.error(`Erro ao enviar relatório para ${managerId}:`, error.message);
      }
    }

    return true;
  } catch (error) {
    console.error('Erro ao enviar relatório diário:', error.message);
    return false;
  }
} exports.sendDailyReport = sendDailyReport;

/*
 * COMO USAR ESTES EXEMPLOS:
 *
 * 1. Importe as funções necessárias em seus controllers/services
 * 2. Chame as funções nos momentos apropriados (criação de OS, finalização, etc.)
 * 3. As funções são fail-safe - não quebram o fluxo principal se Teams falhar
 *
 * Exemplo de uso em WorkOrderController:
 *
 * import { notifyTechnicianWorkOrder } from '../integrations/teams/examples/internalUsage';
 *
 * async createWorkOrder(req, res) {
 *   const workOrder = await this.workOrderService.create(data);
 *
 *   // Notificar via Teams (não bloqueia se falhar)
 *   notifyTechnicianWorkOrder(workOrder, workOrder.technicianId, req.user.id);
 *
 *   return res.json({ success: true, workOrder });
 * }
 */
