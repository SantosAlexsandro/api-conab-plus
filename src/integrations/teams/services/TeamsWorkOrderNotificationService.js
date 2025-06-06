import TeamsService from './TeamsService.js';
import TeamsAuthService from './TeamsAuthService.js';
import axios from 'axios';

// Serviço especializado para notificações de Work Orders no Teams
class TeamsWorkOrderNotificationService {
  constructor() {
    // ID do chat específico fornecido pelo usuário
    this.targetChatId = '19:b2f438dde3f74c5daf960d92dbecf443@thread.v2';

    // Usuário padrão para envio de notificações
    this.defaultNotificationUser = process.env.TEAMS_NOTIFICATION_USER_ID || 'notification_bot';

    this.teamsService = TeamsService;
    this.teamsAuth = TeamsAuthService;
  }

  // Envia notificação de nova ordem de serviço criada
  async sendWorkOrderCreatedNotification(workOrderData) {
    try {
      console.log(`[TeamsWorkOrderNotification] 📋 Enviando notificação de nova OS: ${workOrderData.workOrder}`);

      const isAuthenticated = this.teamsAuth.isUserAuthenticated(this.defaultNotificationUser);

      if (!isAuthenticated) {
        console.warn(`[TeamsWorkOrderNotification] ⚠️ Usuário de notificação não autenticado: ${this.defaultNotificationUser}`);
        return {
          success: false,
          reason: 'notification_user_not_authenticated',
          message: 'Configure a autenticação do usuário de notificação'
        };
      }

      const message = this.formatWorkOrderCreatedMessage(workOrderData);
      const result = await this.sendToSpecificChat(message);

      if (result.success) {
        console.log(`[TeamsWorkOrderNotification] ✅ Notificação enviada com sucesso para OS ${workOrderData.workOrder}`);
      }

      return result;

    } catch (error) {
      console.error(`[TeamsWorkOrderNotification] ❌ Erro ao enviar notificação:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Envia notificação de técnico atribuído
  async sendTechnicianAssignedNotification(workOrderData, technicianData) {
    try {
      console.log(`[TeamsWorkOrderNotification] 👨‍🔧 Enviando notificação de técnico atribuído: OS ${workOrderData.orderId}`);

      const isAuthenticated = this.teamsAuth.isUserAuthenticated(this.defaultNotificationUser);

      if (!isAuthenticated) {
        console.warn(`[TeamsWorkOrderNotification] ⚠️ Usuário de notificação não autenticado`);
        return { success: false, reason: 'notification_user_not_authenticated' };
      }

      const message = this.formatTechnicianAssignedMessage(workOrderData, technicianData);
      const result = await this.sendToSpecificChat(message);

      if (result.success) {
        console.log(`[TeamsWorkOrderNotification] ✅ Notificação de técnico enviada para OS ${workOrderData.orderId}`);
      }

      return result;

    } catch (error) {
      console.error(`[TeamsWorkOrderNotification] ❌ Erro ao enviar notificação de técnico:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Envia notificação de status da ordem
  async sendWorkOrderStatusNotification(workOrderData, status, additionalInfo = {}) {
    try {
      console.log(`[TeamsWorkOrderNotification] 📊 Enviando notificação de status: OS ${workOrderData.orderId} - ${status}`);

      const isAuthenticated = this.teamsAuth.isUserAuthenticated(this.defaultNotificationUser);

      if (!isAuthenticated) {
        console.warn(`[TeamsWorkOrderNotification] ⚠️ Usuário de notificação não autenticado`);
        return { success: false, reason: 'notification_user_not_authenticated' };
      }

      const message = this.formatStatusUpdateMessage(workOrderData, status, additionalInfo);
      const result = await this.sendToSpecificChat(message);

      if (result.success) {
        console.log(`[TeamsWorkOrderNotification] ✅ Notificação de status enviada para OS ${workOrderData.orderId}`);
      }

      return result;

    } catch (error) {
      console.error(`[TeamsWorkOrderNotification] ❌ Erro ao enviar notificação de status:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Envia notificação de técnico atribuído
  async sendTechnicianAssignedNotification(workOrderData, technicianData) {
    try {
      console.log(`[TeamsWorkOrderNotification] 👨‍🔧 Enviando notificação de técnico atribuído: OS ${workOrderData.orderId}`);

      const isAuthenticated = this.teamsAuth.isUserAuthenticated(this.defaultNotificationUser);

      if (!isAuthenticated) {
        console.warn(`[TeamsWorkOrderNotification] ⚠️ Usuário de notificação não autenticado`);
        return { success: false, reason: 'notification_user_not_authenticated' };
      }

      const message = this.formatTechnicianAssignedMessage(workOrderData, technicianData);
      const result = await this.sendToSpecificChat(message);

      if (result.success) {
        console.log(`[TeamsWorkOrderNotification] ✅ Notificação de técnico enviada para OS ${workOrderData.orderId}`);
      }

      return result;

    } catch (error) {
      console.error(`[TeamsWorkOrderNotification] ❌ Erro ao enviar notificação de técnico:`, error.message);
      return { success: false, error: error.message };
    }
  }

    // Envia mensagem para o chat específico
  async sendToSpecificChat(message) {
    try {
      const accessToken = await this.teamsAuth.getValidAccessToken(this.defaultNotificationUser);

      const response = await axios.post(
        `https://graph.microsoft.com/v1.0/chats/${this.targetChatId}/messages`,
        {
          body: {
            contentType: 'html',
            content: message
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`[TeamsWorkOrderNotification] 📤 Mensagem enviada para chat ${this.targetChatId}`);

      return {
        success: true,
        messageId: response.data.id,
        chatId: this.targetChatId
      };

    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      console.error(`[TeamsWorkOrderNotification] ❌ Erro ao enviar para chat específico:`, errorMessage);
      throw new Error(`Teams API Error: ${errorMessage}`);
    }
  }

  // Formata mensagem de nova ordem criada
  formatWorkOrderCreatedMessage(workOrderData) {
    const timestamp = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo'
    });

    return `
<div>
<h3>🆕 <strong>Nova Ordem de Serviço Criada</strong></h3>

<table style="border-collapse: collapse; width: 100%;">
<tr style="background-color: #f0f8ff;">
  <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Número da OS:</td>
  <td style="border: 1px solid #ddd; padding: 8px; color: #0066cc;"><strong>${workOrderData.workOrder}</strong></td>
</tr>
<tr>
  <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Cliente:</td>
  <td style="border: 1px solid #ddd; padding: 8px;">${workOrderData.customerName || 'Não informado'}</td>
</tr>
<tr style="background-color: #f9f9f9;">
  <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Prioridade:</td>
  <td style="border: 1px solid #ddd; padding: 8px;">${this.getPriorityBadge(workOrderData.priority)}</td>
</tr>
<tr>
  <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Contato:</td>
  <td style="border: 1px solid #ddd; padding: 8px;">${workOrderData.requesterContact || 'Não informado'}</td>
</tr>
<tr style="background-color: #f9f9f9;">
  <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Status:</td>
  <td style="border: 1px solid #ddd; padding: 8px;">⏳ <span style="color: #ff6600;"><strong>Aguardando Técnico</strong></span></td>
</tr>
</table>

<div style="margin-top: 15px; padding: 10px; background-color: #e7f3ff; border-left: 4px solid #0066cc;">
<strong>📋 Detalhes:</strong><br/>
${workOrderData.incidentAndReceiverName || 'Sem detalhes adicionais'}
</div>

<div style="margin-top: 10px; font-size: 12px; color: #666;">
📅 <em>Criada em: ${timestamp} | Sistema: CONAB+ | Fonte: G4Flex</em>
</div>
</div>
    `;
  }

  // Formata mensagem de técnico atribuído
  formatTechnicianAssignedMessage(workOrderData, technicianData) {
    const timestamp = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
<div>
<h3>👨‍🔧 <strong>Técnico Atribuído</strong></h3>

<table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
<tr style="background-color: #f0fff0;">
  <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Ordem de Serviço:</td>
  <td style="border: 1px solid #ddd; padding: 8px; color: #0066cc;"><strong>${workOrderData.orderId}</strong></td>
</tr>
<tr>
  <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Técnico:</td>
  <td style="border: 1px solid #ddd; padding: 8px;">👤 <strong>${technicianData.name || technicianData.id}</strong></td>
</tr>
<tr style="background-color: #f9f9f9;">
  <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Cliente:</td>
  <td style="border: 1px solid #ddd; padding: 8px;">${workOrderData.customerName || 'Não informado'}</td>
</tr>
<tr>
  <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Status:</td>
  <td style="border: 1px solid #ddd; padding: 8px;">✅ <span style="color: #009900;"><strong>Técnico Atribuído</strong></span></td>
</tr>
</table>

<div style="margin-top: 10px; font-size: 12px; color: #666;">
📅 <em>Atribuído em: ${timestamp} | Sistema: CONAB+</em>
</div>
</div>
    `;
  }

  // Formata mensagem de atualização de status
  formatStatusUpdateMessage(workOrderData, status, additionalInfo) {
    const timestamp = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const statusInfo = this.getStatusInfo(status);

    return `
<div>
<h3>${statusInfo.icon} <strong>Atualização de Status</strong></h3>

<table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
<tr style="background-color: ${statusInfo.bgColor};">
  <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Ordem de Serviço:</td>
  <td style="border: 1px solid #ddd; padding: 8px; color: #0066cc;"><strong>${workOrderData.orderId}</strong></td>
</tr>
<tr>
  <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Novo Status:</td>
  <td style="border: 1px solid #ddd; padding: 8px;">${statusInfo.icon} <strong style="color: ${statusInfo.color};">${statusInfo.label}</strong></td>
</tr>
<tr style="background-color: #f9f9f9;">
  <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Cliente:</td>
  <td style="border: 1px solid #ddd; padding: 8px;">${workOrderData.customerName || 'Não informado'}</td>
</tr>
</table>

${additionalInfo.message ? `
<div style="margin-top: 15px; padding: 10px; background-color: #f0f8ff; border-left: 4px solid #0066cc;">
<strong>📝 Informações Adicionais:</strong><br/>
${additionalInfo.message}
</div>
` : ''}

<div style="margin-top: 10px; font-size: 12px; color: #666;">
📅 <em>Atualizado em: ${timestamp} | Sistema: CONAB+</em>
</div>
</div>
    `;
  }

  // Formata mensagem de técnico atribuído
  formatTechnicianAssignedMessage(workOrderData, technicianData) {
    const timestamp = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo'
    });

    return `
<div>
<h3>👨‍🔧 <strong>Técnico Atribuído</strong></h3>

<table style="border-collapse: collapse; width: 100%;">
<tr style="background-color: #f0fff0;">
  <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Ordem de Serviço:</td>
  <td style="border: 1px solid #ddd; padding: 8px; color: #0066cc;"><strong>${workOrderData.orderId}</strong></td>
</tr>
<tr>
  <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Técnico:</td>
  <td style="border: 1px solid #ddd; padding: 8px;">👤 <strong>${technicianData.name || technicianData.id}</strong></td>
</tr>
<tr style="background-color: #f9f9f9;">
  <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Cliente:</td>
  <td style="border: 1px solid #ddd; padding: 8px;">${workOrderData.customerName || 'Não informado'}</td>
</tr>
<tr>
  <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Status:</td>
  <td style="border: 1px solid #ddd; padding: 8px;">✅ <span style="color: #009900;"><strong>Técnico Atribuído</strong></span></td>
</tr>
</table>

<div style="margin-top: 10px; font-size: 12px; color: #666;">
📅 <em>Atribuído em: ${timestamp} | Sistema: CONAB+</em>
</div>
</div>
    `;
  }

  // Retorna badge de prioridade formatado
  getPriorityBadge(priority) {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'alta':
        return '🔴 <strong style="color: #cc0000;">ALTA</strong>';
      case 'medium':
      case 'média':
      case 'media':
        return '🟡 <strong style="color: #ff6600;">MÉDIA</strong>';
      case 'low':
      case 'baixa':
        return '🟢 <strong style="color: #009900;">BAIXA</strong>';
      default:
        return '⚪ <strong>NORMAL</strong>';
    }
  }

  // Retorna informações de status formatadas
  getStatusInfo(status) {
    const statusMap = {
      'WAITING_TECHNICIAN': {
        icon: '⏳',
        label: 'Aguardando Técnico',
        color: '#ff6600',
        bgColor: '#fff3e0'
      },
      'ASSIGNED': {
        icon: '✅',
        label: 'Técnico Atribuído',
        color: '#009900',
        bgColor: '#f0fff0'
      },
      'IN_PROGRESS': {
        icon: '🔧',
        label: 'Em Andamento',
        color: '#0066cc',
        bgColor: '#e7f3ff'
      },
      'COMPLETED': {
        icon: '✅',
        label: 'Concluída',
        color: '#009900',
        bgColor: '#f0fff0'
      },
      'CANCELLED': {
        icon: '❌',
        label: 'Cancelada',
        color: '#cc0000',
        bgColor: '#ffe7e7'
      },
      'FAILED': {
        icon: '❌',
        label: 'Falha',
        color: '#cc0000',
        bgColor: '#ffe7e7'
      }
    };

    return statusMap[status] || {
      icon: '📊',
      label: status,
      color: '#666666',
      bgColor: '#f9f9f9'
    };
  }

  // Configurar usuário padrão para notificações
  setDefaultNotificationUser(userId) {
    this.defaultNotificationUser = userId;
    console.log(`[TeamsWorkOrderNotification] 🔧 Usuário de notificação configurado: ${userId}`);
  }

  // Verificar status de configuração
  getConfigurationStatus() {
    const isUserAuthenticated = this.teamsAuth.isUserAuthenticated(this.defaultNotificationUser);

    return {
      targetChatId: this.targetChatId,
      notificationUser: this.defaultNotificationUser,
      isAuthenticated: isUserAuthenticated,
      configured: !!this.targetChatId && isUserAuthenticated
    };
  }
}

const teamsWorkOrderNotificationService = new TeamsWorkOrderNotificationService();
export default teamsWorkOrderNotificationService;
