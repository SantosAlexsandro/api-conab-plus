"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
// Removido import do logEvent para usar console.log/error diretamente
var _TeamsAuthService = require('./TeamsAuthService'); var _TeamsAuthService2 = _interopRequireDefault(_TeamsAuthService);

class TeamsService {
  constructor() {
    this.authService = _TeamsAuthService2.default;
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

      const response = await _axios2.default.post(
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
      console.error(`[TeamsService] Erro ao enviar mensagem: ${_optionalChain([error, 'access', _ => _.response, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.error, 'optionalAccess', _4 => _4.message]) || error.message}`);
      throw new Error(`Erro ao enviar mensagem: ${_optionalChain([error, 'access', _5 => _5.response, 'optionalAccess', _6 => _6.data, 'optionalAccess', _7 => _7.error, 'optionalAccess', _8 => _8.message]) || error.message}`);
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

      const response = await _axios2.default.post(
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
      console.error(`[TeamsService] Erro ao criar chat: ${_optionalChain([error, 'access', _9 => _9.response, 'optionalAccess', _10 => _10.data, 'optionalAccess', _11 => _11.error, 'optionalAccess', _12 => _12.message]) || error.message}`);
      throw new Error(`Erro ao criar chat: ${_optionalChain([error, 'access', _13 => _13.response, 'optionalAccess', _14 => _14.data, 'optionalAccess', _15 => _15.error, 'optionalAccess', _16 => _16.message]) || error.message}`);
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

      const response = await _axios2.default.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`[TeamsService] Chats listados para usuário ${userId}: ${response.data.value.length} encontrados`);
      return response.data.value;
    } catch (error) {
      console.error(`[TeamsService] Erro ao listar chats: ${_optionalChain([error, 'access', _17 => _17.response, 'optionalAccess', _18 => _18.data, 'optionalAccess', _19 => _19.error, 'optionalAccess', _20 => _20.message]) || error.message}`);
      throw new Error(`Erro ao listar chats: ${_optionalChain([error, 'access', _21 => _21.response, 'optionalAccess', _22 => _22.data, 'optionalAccess', _23 => _23.error, 'optionalAccess', _24 => _24.message]) || error.message}`);
    }
  }

  // Obtém mensagens de um chat específico
  async getChatMessages(userId, chatId, top = 20) {
    try {
      const accessToken = await this.authService.getValidAccessToken(userId);

      const response = await _axios2.default.get(
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
      console.error(`[TeamsService] Erro ao obter mensagens: ${_optionalChain([error, 'access', _25 => _25.response, 'optionalAccess', _26 => _26.data, 'optionalAccess', _27 => _27.error, 'optionalAccess', _28 => _28.message]) || error.message}`);
      throw new Error(`Erro ao obter mensagens: ${_optionalChain([error, 'access', _29 => _29.response, 'optionalAccess', _30 => _30.data, 'optionalAccess', _31 => _31.error, 'optionalAccess', _32 => _32.message]) || error.message}`);
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

      const response = await _axios2.default.post(
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
      console.error(`[TeamsService] Erro ao enviar notificação: ${_optionalChain([error, 'access', _33 => _33.response, 'optionalAccess', _34 => _34.data, 'optionalAccess', _35 => _35.error, 'optionalAccess', _36 => _36.message]) || error.message}`);
      throw new Error(`Erro ao enviar notificação: ${_optionalChain([error, 'access', _37 => _37.response, 'optionalAccess', _38 => _38.data, 'optionalAccess', _39 => _39.error, 'optionalAccess', _40 => _40.message]) || error.message}`);
    }
  }

  // Busca usuários por email ou nome
  async searchUsers(userId, searchTerm, top = 10) {
    try {
      const accessToken = await this.authService.getValidAccessToken(userId);

      const response = await _axios2.default.get(
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
      console.error(`[TeamsService] Erro ao buscar usuários: ${_optionalChain([error, 'access', _41 => _41.response, 'optionalAccess', _42 => _42.data, 'optionalAccess', _43 => _43.error, 'optionalAccess', _44 => _44.message]) || error.message}`);
      throw new Error(`Erro ao buscar usuários: ${_optionalChain([error, 'access', _45 => _45.response, 'optionalAccess', _46 => _46.data, 'optionalAccess', _47 => _47.error, 'optionalAccess', _48 => _48.message]) || error.message}`);
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

      const response = await _axios2.default.post(
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
      console.error(`[TeamsService] Erro ao enviar mensagem com anexo: ${_optionalChain([error, 'access', _49 => _49.response, 'optionalAccess', _50 => _50.data, 'optionalAccess', _51 => _51.error, 'optionalAccess', _52 => _52.message]) || error.message}`);
      throw new Error(`Erro ao enviar mensagem com anexo: ${_optionalChain([error, 'access', _53 => _53.response, 'optionalAccess', _54 => _54.data, 'optionalAccess', _55 => _55.error, 'optionalAccess', _56 => _56.message]) || error.message}`);
    }
  }

  // Marca mensagem como lida
  async markMessageAsRead(userId, chatId, messageId) {
    try {
      const accessToken = await this.authService.getValidAccessToken(userId);

      await _axios2.default.patch(
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
      console.error(`[TeamsService] Erro ao marcar mensagem como lida: ${_optionalChain([error, 'access', _57 => _57.response, 'optionalAccess', _58 => _58.data, 'optionalAccess', _59 => _59.error, 'optionalAccess', _60 => _60.message]) || error.message}`);
      throw new Error(`Erro ao marcar mensagem como lida: ${_optionalChain([error, 'access', _61 => _61.response, 'optionalAccess', _62 => _62.data, 'optionalAccess', _63 => _63.error, 'optionalAccess', _64 => _64.message]) || error.message}`);
    }
  }

  // Obtém presença do usuário
  async getUserPresence(userId, targetUserId = 'me') {
    try {
      const accessToken = await this.authService.getValidAccessToken(userId);

      const endpoint = targetUserId === 'me' ? 'me/presence' : `users/${targetUserId}/presence`;

      const response = await _axios2.default.get(
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
      console.error(`[TeamsService] Erro ao obter presença: ${_optionalChain([error, 'access', _65 => _65.response, 'optionalAccess', _66 => _66.data, 'optionalAccess', _67 => _67.error, 'optionalAccess', _68 => _68.message]) || error.message}`);
      throw new Error(`Erro ao obter presença: ${_optionalChain([error, 'access', _69 => _69.response, 'optionalAccess', _70 => _70.data, 'optionalAccess', _71 => _71.error, 'optionalAccess', _72 => _72.message]) || error.message}`);
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

      await _axios2.default.post(
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
      console.error(`[TeamsService] Erro ao definir presença: ${_optionalChain([error, 'access', _73 => _73.response, 'optionalAccess', _74 => _74.data, 'optionalAccess', _75 => _75.error, 'optionalAccess', _76 => _76.message]) || error.message}`);
      throw new Error(`Erro ao definir presença: ${_optionalChain([error, 'access', _77 => _77.response, 'optionalAccess', _78 => _78.data, 'optionalAccess', _79 => _79.error, 'optionalAccess', _80 => _80.message]) || error.message}`);
    }
  }
}

const teamsService = new TeamsService();
exports. default = teamsService;
