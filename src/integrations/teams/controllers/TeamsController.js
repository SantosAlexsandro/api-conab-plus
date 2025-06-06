/*
 * ARQUIVO COMENTADO - CONTROLLER NÃO NECESSÁRIO PARA USO INTERNO
 *
 * Este arquivo contém os controllers HTTP para a integração com Teams.
 * Como estamos usando apenas internamente (chamadas diretas aos services),
 * este controller não é necessário.
 *
 * Para reativar: descomente o código abaixo e reative as rotas
 */

/*
import TeamsAuthService from '../services/TeamsAuthService';
import TeamsService from '../services/TeamsService';
import logEvent from '../../../utils/logEvent';

class TeamsController {
  // Inicia processo de autenticação
  async initiateAuth(req, res) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          errors: ['UserId é obrigatório']
        });
      }

      // Verifica se usuário já está autenticado
      if (TeamsAuthService.isUserAuthenticated(userId)) {
        return res.status(200).json({
          success: true,
          message: 'Usuário já está autenticado',
          isAuthenticated: true
        });
      }

      const authUrl = TeamsAuthService.generateAuthUrl(userId);

      return res.status(200).json({
        success: true,
        authUrl,
        message: 'Acesse a URL para autorizar a aplicação'
      });
    } catch (error) {
      logEvent('error', 'TeamsController', `Erro ao iniciar autenticação: ${error.message}`);
      return res.status(500).json({
        success: false,
        errors: ['Erro interno do servidor']
      });
    }
  }

  // Callback da autenticação OAuth
  async authCallback(req, res) {
    try {
      const { code, state, error } = req.query;

      if (error) {
        logEvent('error', 'TeamsController', `Erro na autenticação OAuth: ${error}`);
        return res.status(400).json({
          success: false,
          errors: [`Erro de autenticação: ${error}`]
        });
      }

      if (!code || !state) {
        return res.status(400).json({
          success: false,
          errors: ['Código de autorização ou state inválido']
        });
      }

      const userId = state; // state contém o userId
      const tokens = await TeamsAuthService.exchangeCodeForTokens(code, userId);

      return res.status(200).json({
        success: true,
        message: 'Autenticação realizada com sucesso',
        userId,
        expiresAt: tokens.expiresAt
      });
    } catch (error) {
      logEvent('error', 'TeamsController', `Erro no callback de autenticação: ${error.message}`);
      return res.status(500).json({
        success: false,
        errors: ['Erro ao processar autenticação']
      });
    }
  }

  // Verifica status de autenticação
  async checkAuth(req, res) {
    try {
      const { userId } = req.params;

      const isAuthenticated = TeamsAuthService.isUserAuthenticated(userId);
      const isValid = isAuthenticated ? await TeamsAuthService.validateToken(userId) : false;

      return res.status(200).json({
        success: true,
        isAuthenticated,
        isValid,
        userId
      });
    } catch (error) {
      logEvent('error', 'TeamsController', `Erro ao verificar autenticação: ${error.message}`);
      return res.status(500).json({
        success: false,
        errors: ['Erro ao verificar status de autenticação']
      });
    }
  }

  // Remove autenticação do usuário
  async logout(req, res) {
    try {
      const { userId } = req.params;

      const success = TeamsAuthService.revokeUserTokens(userId);

      return res.status(200).json({
        success,
        message: success ? 'Logout realizado com sucesso' : 'Erro ao realizar logout'
      });
    } catch (error) {
      logEvent('error', 'TeamsController', `Erro no logout: ${error.message}`);
      return res.status(500).json({
        success: false,
        errors: ['Erro interno do servidor']
      });
    }
  }

  // Envia mensagem para chat
  async sendMessage(req, res) {
    try {
      const { userId, chatId, message, messageType } = req.body;

      if (!userId || !chatId || !message) {
        return res.status(400).json({
          success: false,
          errors: ['UserId, chatId e message são obrigatórios']
        });
      }

      const result = await TeamsService.sendMessageToChat(userId, chatId, message, messageType);

      return res.status(200).json({
        success: true,
        message: 'Mensagem enviada com sucesso',
        data: result
      });
    } catch (error) {
      logEvent('error', 'TeamsController', `Erro ao enviar mensagem: ${error.message}`);
      return res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  }

  // Cria novo chat
  async createChat(req, res) {
    try {
      const { userId, participants, chatType, topic } = req.body;

      if (!userId || !participants || !Array.isArray(participants) || participants.length === 0) {
        return res.status(400).json({
          success: false,
          errors: ['UserId e array de participants são obrigatórios']
        });
      }

      const result = await TeamsService.createChat(userId, participants, chatType, topic);

      return res.status(201).json({
        success: true,
        message: 'Chat criado com sucesso',
        data: result
      });
    } catch (error) {
      logEvent('error', 'TeamsController', `Erro ao criar chat: ${error.message}`);
      return res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  }

  // Lista chats do usuário
  async getUserChats(req, res) {
    try {
      const { userId } = req.params;
      const { filter } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          errors: ['UserId é obrigatório']
        });
      }

      const chats = await TeamsService.getUserChats(userId, filter);

      return res.status(200).json({
        success: true,
        data: chats,
        count: chats.length
      });
    } catch (error) {
      logEvent('error', 'TeamsController', `Erro ao listar chats: ${error.message}`);
      return res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  }

  // Obtém mensagens de um chat
  async getChatMessages(req, res) {
    try {
      const { userId, chatId } = req.params;
      const { top = 20 } = req.query;

      if (!userId || !chatId) {
        return res.status(400).json({
          success: false,
          errors: ['UserId e chatId são obrigatórios']
        });
      }

      const messages = await TeamsService.getChatMessages(userId, chatId, parseInt(top));

      return res.status(200).json({
        success: true,
        data: messages,
        count: messages.length
      });
    } catch (error) {
      logEvent('error', 'TeamsController', `Erro ao obter mensagens: ${error.message}`);
      return res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  }

  // Envia notificação de atividade
  async sendNotification(req, res) {
    try {
      const { userId, targetUserId, topic, activityType, templateParameters } = req.body;

      if (!userId || !targetUserId || !topic || !activityType) {
        return res.status(400).json({
          success: false,
          errors: ['UserId, targetUserId, topic e activityType são obrigatórios']
        });
      }

      const result = await TeamsService.sendActivityNotification(
        userId,
        targetUserId,
        topic,
        activityType,
        templateParameters
      );

      return res.status(200).json({
        success: true,
        message: 'Notificação enviada com sucesso',
        data: result
      });
    } catch (error) {
      logEvent('error', 'TeamsController', `Erro ao enviar notificação: ${error.message}`);
      return res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  }

  // Busca usuários
  async searchUsers(req, res) {
    try {
      const { userId } = req.params;
      const { searchTerm, top = 10 } = req.query;

      if (!userId || !searchTerm) {
        return res.status(400).json({
          success: false,
          errors: ['UserId e searchTerm são obrigatórios']
        });
      }

      const users = await TeamsService.searchUsers(userId, searchTerm, parseInt(top));

      return res.status(200).json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error) {
      logEvent('error', 'TeamsController', `Erro ao buscar usuários: ${error.message}`);
      return res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  }

  // Envia mensagem com anexo
  async sendMessageWithAttachment(req, res) {
    try {
      const { userId, chatId, message, attachmentUrl, attachmentName } = req.body;

      if (!userId || !chatId || !message || !attachmentUrl || !attachmentName) {
        return res.status(400).json({
          success: false,
          errors: ['Todos os campos são obrigatórios: userId, chatId, message, attachmentUrl, attachmentName']
        });
      }

      const result = await TeamsService.sendMessageWithAttachment(
        userId,
        chatId,
        message,
        attachmentUrl,
        attachmentName
      );

      return res.status(200).json({
        success: true,
        message: 'Mensagem com anexo enviada com sucesso',
        data: result
      });
    } catch (error) {
      logEvent('error', 'TeamsController', `Erro ao enviar mensagem com anexo: ${error.message}`);
      return res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  }

  // Obtém presença do usuário
  async getUserPresence(req, res) {
    try {
      const { userId } = req.params;
      const { targetUserId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          errors: ['UserId é obrigatório']
        });
      }

      const presence = await TeamsService.getUserPresence(userId, targetUserId);

      return res.status(200).json({
        success: true,
        data: presence
      });
    } catch (error) {
      logEvent('error', 'TeamsController', `Erro ao obter presença: ${error.message}`);
      return res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  }

  // Define presença do usuário
  async setUserPresence(req, res) {
    try {
      const { userId, availability, activity } = req.body;

      if (!userId || !availability || !activity) {
        return res.status(400).json({
          success: false,
          errors: ['UserId, availability e activity são obrigatórios']
        });
      }

      await TeamsService.setUserPresence(userId, availability, activity);

      return res.status(200).json({
        success: true,
        message: 'Presença definida com sucesso'
      });
    } catch (error) {
      logEvent('error', 'TeamsController', `Erro ao definir presença: ${error.message}`);
      return res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  }

  // Obtém informações do usuário autenticado
  async getUserInfo(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          errors: ['UserId é obrigatório']
        });
      }

      const userInfo = await TeamsAuthService.getUserInfo(userId);

      return res.status(200).json({
        success: true,
        data: userInfo
      });
    } catch (error) {
      logEvent('error', 'TeamsController', `Erro ao obter informações do usuário: ${error.message}`);
      return res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  }
}

export default new TeamsController();
*/
