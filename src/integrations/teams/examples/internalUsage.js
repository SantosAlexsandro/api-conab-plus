/*
 * EXEMPLOS DE USO INTERNO - INTEGRAÇÃO TEAMS
 *
 * Este arquivo contém exemplos práticos de como usar a integração Teams
 * internamente na aplicação, sem necessidade de rotas HTTP.
 */

import TeamsAuthService from '../services/TeamsAuthService';
import TeamsService from '../services/TeamsService';
import { createWorkOrderNotification, formatHTMLMessage } from '../utils/teamsHelpers';

// Exemplo 1: Notificar técnico sobre nova ordem de serviço
export async function notifyTechnicianWorkOrder(workOrder, technicianUserId, supervisorUserId) {
  try {
    // Verificar se técnico está autenticado no Teams
    if (!TeamsAuthService.isUserAuthenticated(technicianUserId)) {
      console.log(`Técnico ${technicianUserId} não está autenticado no Teams`);
      return false;
    }

    // Buscar chats do supervisor
    const chats = await TeamsService.getUserChats(supervisorUserId);

    // Procurar chat existente com o técnico
    let targetChat = chats.find(chat =>
      chat.members && chat.members.some(member => member.userId === technicianUserId)
    );

    // Se não encontrar chat, criar novo
    if (!targetChat) {
      targetChat = await TeamsService.createChat(
        supervisorUserId,
        [{ id: technicianUserId }],
        'oneOnOne'
      );
    }

    // Formatar mensagem
    const message = formatHTMLMessage(
      `🔧 Nova Ordem de Serviço #${workOrder.number}\n` +
      `📍 Local: ${workOrder.location}\n` +
      `⏰ Prazo: ${workOrder.dueDate}\n` +
      `📝 Descrição: ${workOrder.description}`,
      { bold: true }
    );

    // Enviar mensagem
    await TeamsService.sendMessageToChat(
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
}

// Exemplo 2: Notificar finalização de ordem de serviço
export async function notifyWorkOrderCompletion(workOrder, supervisorUserId) {
  try {
    if (!TeamsAuthService.isUserAuthenticated(supervisorUserId)) {
      return false;
    }

    // Criar notificação de atividade
    await TeamsService.sendActivityNotification(
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
}

// Exemplo 3: Enviar lembrete de ordem pendente
export async function sendPendingOrderReminder(pendingOrders, technicianUserId, supervisorUserId) {
  try {
    if (!TeamsAuthService.isUserAuthenticated(technicianUserId) ||
        !TeamsAuthService.isUserAuthenticated(supervisorUserId)) {
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
    const chats = await TeamsService.getUserChats(supervisorUserId);
    const targetChat = chats.find(chat =>
      chat.members && chat.members.some(member => member.userId === technicianUserId)
    );

    if (targetChat) {
      await TeamsService.sendMessageToChat(
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
}

// Exemplo 4: Integração com sistema de turnos
export async function notifyShiftChange(shiftInfo, teamMembers, supervisorUserId) {
  try {
    if (!TeamsAuthService.isUserAuthenticated(supervisorUserId)) {
      return false;
    }

    // Criar chat em grupo para o turno
    const chatParticipants = teamMembers.map(member => ({ id: member.userId }));

    const groupChat = await TeamsService.createChat(
      supervisorUserId,
      chatParticipants,
      'group',
      `Turno ${shiftInfo.shiftName} - ${shiftInfo.date}`
    );

    // Mensagem de início de turno
    const welcomeMessage = formatHTMLMessage(
      `🚀 **Início do Turno ${shiftInfo.shiftName}**\n\n` +
      `📅 Data: ${shiftInfo.date}\n` +
      `⏰ Horário: ${shiftInfo.startTime} às ${shiftInfo.endTime}\n` +
      `👥 Equipe: ${teamMembers.map(m => m.name).join(', ')}\n\n` +
      `📋 Ordens programadas: ${shiftInfo.scheduledOrders}\n` +
      `🎯 Meta do dia: ${shiftInfo.dailyGoal}`,
      { bold: true }
    );

    await TeamsService.sendMessageToChat(
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
}

// Exemplo 5: Status de emergência
export async function sendEmergencyAlert(emergencyInfo, allTeamUserIds, supervisorUserId) {
  try {
    if (!TeamsAuthService.isUserAuthenticated(supervisorUserId)) {
      return false;
    }

    const emergencyMessage = formatHTMLMessage(
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
        if (!TeamsAuthService.isUserAuthenticated(technicianId)) {
          return { technicianId, success: false, reason: 'not_authenticated' };
        }

        // Buscar ou criar chat individual
        const chats = await TeamsService.getUserChats(supervisorUserId);
        let targetChat = chats.find(chat =>
          chat.members && chat.members.some(member => member.userId === technicianId)
        );

        if (!targetChat) {
          targetChat = await TeamsService.createChat(
            supervisorUserId,
            [{ id: technicianId }],
            'oneOnOne'
          );
        }

        await TeamsService.sendMessageToChat(
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
}

// Exemplo 6: Relatório diário automático
export async function sendDailyReport(reportData, managementUserIds, supervisorUserId) {
  try {
    if (!TeamsAuthService.isUserAuthenticated(supervisorUserId)) {
      return false;
    }

    const reportMessage = formatHTMLMessage(
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
        if (TeamsAuthService.isUserAuthenticated(managerId)) {
          await TeamsService.sendActivityNotification(
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
}

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
