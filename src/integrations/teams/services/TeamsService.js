import axios from 'axios';
// Removido import do logEvent para usar console.log/error diretamente
import TeamsAuthService from './TeamsAuthService';

class TeamsService {
  constructor() {
    this.authService = TeamsAuthService;
    this.baseUrl = 'https://graph.microsoft.com/v1.0';
  }

  // Envia mensagem para um chat específico
  async sendMessageToChat(userId, chatId, message, messageType = 'text') {
    try {
      const accessToken = await this.authService.getValidAccessToken(userId);

      let messageBody;
      if (messageType === 'html') {
        messageBody = {
          contentType: 'html',
          content: message
        };
      } else {
        messageBody = {
          contentType: 'text',
          content: message
        };
      }

      const payload = {
        body: messageBody
      };

      const response = await axios.post(
        `${this.baseUrl}/chats/${chatId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`[TeamsService] Mensagem enviada para chat ${chatId} pelo usuário ${userId}`);
      return response.data;
    } catch (error) {
      console.error(`[TeamsService] Erro ao enviar mensagem: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Erro ao enviar mensagem: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Cria um novo chat com usuários específicos
  async createChat(userId, participants, chatType = 'group', topic = null) {
    try {
      const accessToken = await this.authService.getValidAccessToken(userId);

      const members = participants.map(participant => ({
        '@odata.type': '#microsoft.graph.aadUserConversationMember',
        'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${participant.email || participant.id}')`
      }));

      const payload = {
        chatType: chatType,
        members: members
      };

      if (topic && chatType === 'group') {
        payload.topic = topic;
      }

      const response = await axios.post(
        `${this.baseUrl}/chats`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`[TeamsService] Chat criado com ID ${response.data.id} pelo usuário ${userId}`);
      return response.data;
    } catch (error) {
      console.error(`[TeamsService] Erro ao criar chat: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Erro ao criar chat: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Lista todos os chats do usuário
  async getUserChats(userId, filter = null) {
    try {
      const accessToken = await this.authService.getValidAccessToken(userId);

      let url = `${this.baseUrl}/me/chats`;
      if (filter) {
        url += `?$filter=${encodeURIComponent(filter)}`;
      }

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`[TeamsService] Chats listados para usuário ${userId}: ${response.data.value.length} encontrados`);
      return response.data.value;
    } catch (error) {
      console.error(`[TeamsService] Erro ao listar chats: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Erro ao listar chats: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Obtém mensagens de um chat específico
  async getChatMessages(userId, chatId, top = 20) {
    try {
      const accessToken = await this.authService.getValidAccessToken(userId);

      const response = await axios.get(
        `${this.baseUrl}/chats/${chatId}/messages?$top=${top}&$orderby=createdDateTime desc`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`[TeamsService] Mensagens obtidas do chat ${chatId} para usuário ${userId}`);
      return response.data.value;
    } catch (error) {
      console.error(`[TeamsService] Erro ao obter mensagens: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Erro ao obter mensagens: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Envia notificação de atividade para o usuário
  async sendActivityNotification(userId, targetUserId, topic, activityType, templateParameters = {}) {
    try {
      const accessToken = await this.authService.getValidAccessToken(userId);

      const payload = {
        topic: {
          source: 'text',
          value: topic
        },
        activityType: activityType,
        previewText: {
          content: templateParameters.previewText || 'Nova notificação'
        },
        recipient: {
          '@odata.type': 'microsoft.graph.aadUserNotificationRecipient',
          userId: targetUserId
        },
        templateParameters: templateParameters
      };

      const response = await axios.post(
        `${this.baseUrl}/me/teamwork/sendActivityNotification`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`[TeamsService] Notificação de atividade enviada para usuário ${targetUserId}`);
      return response.data;
    } catch (error) {
      console.error(`[TeamsService] Erro ao enviar notificação: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Erro ao enviar notificação: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Busca usuários por email ou nome
  async searchUsers(userId, searchTerm, top = 10) {
    try {
      const accessToken = await this.authService.getValidAccessToken(userId);

      const response = await axios.get(
        `${this.baseUrl}/users?$search="displayName:${searchTerm}" OR "mail:${searchTerm}"&$top=${top}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'ConsistencyLevel': 'eventual'
          }
        }
      );

      console.log(`[TeamsService] Busca de usuários realizada: ${response.data.value.length} resultados para "${searchTerm}"`);
      return response.data.value;
    } catch (error) {
      console.error(`[TeamsService] Erro ao buscar usuários: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Erro ao buscar usuários: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Envia mensagem com anexo
  async sendMessageWithAttachment(userId, chatId, message, attachmentUrl, attachmentName) {
    try {
      const accessToken = await this.authService.getValidAccessToken(userId);

      const payload = {
        body: {
          contentType: 'html',
          content: `${message}<br><a href="${attachmentUrl}">${attachmentName}</a>`
        },
        attachments: [
          {
            id: Date.now().toString(),
            contentType: 'reference',
            contentUrl: attachmentUrl,
            name: attachmentName
          }
        ]
      };

      const response = await axios.post(
        `${this.baseUrl}/chats/${chatId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`[TeamsService] Mensagem com anexo enviada para chat ${chatId}`);
      return response.data;
    } catch (error) {
      console.error(`[TeamsService] Erro ao enviar mensagem com anexo: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Erro ao enviar mensagem com anexo: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Marca mensagem como lida
  async markMessageAsRead(userId, chatId, messageId) {
    try {
      const accessToken = await this.authService.getValidAccessToken(userId);

      await axios.patch(
        `${this.baseUrl}/chats/${chatId}/messages/${messageId}`,
        { importance: 'normal' },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`[TeamsService] Mensagem ${messageId} marcada como lida no chat ${chatId}`);
      return true;
    } catch (error) {
      console.error(`[TeamsService] Erro ao marcar mensagem como lida: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Erro ao marcar mensagem como lida: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Obtém presença do usuário
  async getUserPresence(userId, targetUserId = 'me') {
    try {
      const accessToken = await this.authService.getValidAccessToken(userId);

      const endpoint = targetUserId === 'me' ? 'me/presence' : `users/${targetUserId}/presence`;

      const response = await axios.get(
        `${this.baseUrl}/${endpoint}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`[TeamsService] Presença obtida para usuário ${targetUserId}`);
      return response.data;
    } catch (error) {
      console.error(`[TeamsService] Erro ao obter presença: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Erro ao obter presença: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Define presença do usuário
  async setUserPresence(userId, availability, activity) {
    try {
      const accessToken = await this.authService.getValidAccessToken(userId);

      const payload = {
        availability: availability, // Available, Busy, DoNotDisturb, BeRightBack, Away
        activity: activity // Available, InACall, InAConferenceCall, InAMeeting, Busy, etc.
      };

      await axios.post(
        `${this.baseUrl}/me/presence/setPresence`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`[TeamsService] Presença definida para usuário ${userId}: ${availability}/${activity}`);
      return true;
    } catch (error) {
      console.error(`[TeamsService] Erro ao definir presença: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Erro ao definir presença: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

const teamsService = new TeamsService();
export default teamsService;
