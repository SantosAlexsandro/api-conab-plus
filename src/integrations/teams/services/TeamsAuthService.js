import axios from 'axios';
import TeamsToken from '../../../models/TeamsToken.js';
import { Op } from 'sequelize';

class TeamsAuthService {
  constructor() {
    this.clientId = process.env.TEAMS_CLIENT_ID;
    this.clientSecret = process.env.TEAMS_CLIENT_SECRET;
    this.tenantId = process.env.TEAMS_TENANT_ID;
    this.redirectUri = process.env.TEAMS_REDIRECT_URI;

    // Definir escopos separadamente para evitar truncamento na URL
    this.scopes = [
      'https://graph.microsoft.com/User.Read',
      'https://graph.microsoft.com/Chat.ReadWrite',
      'https://graph.microsoft.com/ChatMessage.Send',
      'https://graph.microsoft.com/offline_access'
    ];
    this.scope = this.scopes.join(' ');

    this.baseUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0`;

    // Cache em memória para performance (dados persistem no MySQL)
    this.tokenCache = new Map();
  }

  // Gera URL de autorização para o usuário
  generateAuthUrl(userId, state = null) {
    try {
      // Construir URL manualmente para melhor controle sobre a codificação
      const params = [
        `client_id=${encodeURIComponent(this.clientId)}`,
        `response_type=code`,
        `redirect_uri=${encodeURIComponent(this.redirectUri)}`,
        `response_mode=query`,
        `scope=${encodeURIComponent(this.scope)}`,
        `state=${encodeURIComponent(state || userId)}`
      ];

      const authUrl = `${this.baseUrl}/authorize?${params.join('&')}`;

      console.log(`[TeamsAuthService] URL de autorização gerada para usuário ${userId}`);
      console.log(`[TeamsAuthService] Scope utilizado: ${this.scope}`);
      return authUrl;
    } catch (error) {
      console.error(`[TeamsAuthService] Erro ao gerar URL de autorização: ${error.message}`);
      throw new Error(`Erro ao gerar URL de autorização: ${error.message}`);
    }
  }

  // Troca código de autorização por tokens
  async exchangeCodeForTokens(authCode, userId) {
    try {
      const tokenData = {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: this.scope,
        code: authCode,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code'
      };

      const response = await axios.post(`${this.baseUrl}/token`,
        new URLSearchParams(tokenData).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const expiresAt = new Date(Date.now() + (response.data.expires_in * 1000));

      const tokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,
        scope: response.data.scope,
        expiresAt
      };

      // Persistir no banco MySQL usando upsert do Sequelize v6
      try {
        const [instance, created] = await TeamsToken.upsert({
          user_id: userId,
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          token_type: response.data.token_type,
          scope: response.data.scope,
          expires_at: expiresAt,
          expires_in: response.data.expires_in,
          is_active: true
        }, {
          returning: true,
          conflictFields: ['user_id']
        });

        console.log(`[TeamsAuthService] Token ${created ? 'criado' : 'atualizado'} no MySQL para usuário ${userId}`);
      } catch (dbError) {
        console.warn(`[TeamsAuthService] Aviso: Erro ao persistir no MySQL: ${dbError.message}`);
        // Continuar mesmo se houver erro no banco, pois o cache funcionará
      }

      // Atualizar cache em memória para performance
      this.tokenCache.set(userId, tokens);

      // Agendar renovação automática usando BullMQ
      try {
        const { scheduleUserTokenRefresh } = await import('../queues/teamsTokenRefreshQueue.js');
        await scheduleUserTokenRefresh(userId, expiresAt);
      } catch (error) {
        console.warn(`[TeamsAuthService] Erro ao agendar renovação automática: ${error.message}`);
      }

      console.log(`[TeamsAuthService] Tokens obtidos e persistidos no MySQL para usuário ${userId}`);
      return tokens;
    } catch (error) {
      console.error(`[TeamsAuthService] Erro ao trocar código por tokens: ${error.response?.data?.error_description || error.message}`);
      throw new Error(`Erro ao obter tokens de acesso: ${error.response?.data?.error_description || error.message}`);
    }
  }

  // Renova access token usando refresh token
  async refreshAccessToken(userId) {
    try {
      // Buscar tokens do cache ou banco
      let storedTokens = this.tokenCache.get(userId);

      if (!storedTokens) {
                const tokenRecord = await TeamsToken.findOne({
          where: { user_id: userId, is_active: true }
        });

        if (!tokenRecord) {
          throw new Error('Tokens não encontrados para o usuário');
        }

        storedTokens = {
          accessToken: tokenRecord.access_token,
          refreshToken: tokenRecord.refresh_token,
          expiresAt: tokenRecord.expires_at,
          tokenType: tokenRecord.token_type,
          scope: tokenRecord.scope
        };
      }

      if (!storedTokens?.refreshToken) {
        throw new Error('Refresh token não encontrado para o usuário');
      }

      // Validar refresh token antes de enviar
      if (typeof storedTokens.refreshToken !== 'string' || storedTokens.refreshToken.trim() === '') {
        throw new Error('Refresh token inválido ou corrompido');
      }

      const tokenData = {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: this.scope,
        refresh_token: storedTokens.refreshToken.trim(),
        grant_type: 'refresh_token'
      };

      const response = await axios.post(`${this.baseUrl}/token`,
        new URLSearchParams(tokenData).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const expiresAt = new Date(Date.now() + (response.data.expires_in * 1000));

      const newTokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || storedTokens.refreshToken,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,
        scope: response.data.scope,
        expiresAt
      };

      // Atualizar no banco MySQL
      await TeamsToken.update({
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token || storedTokens.refreshToken,
        token_type: response.data.token_type,
        scope: response.data.scope,
        expires_at: expiresAt,
        expires_in: response.data.expires_in
      }, {
        where: { user_id: userId, is_active: true }
      });

      // Atualizar cache em memória
      this.tokenCache.set(userId, newTokens);

      // Reagendar próxima renovação usando BullMQ
      try {
        const { scheduleUserTokenRefresh } = await import('../queues/teamsTokenRefreshQueue.js');
        await scheduleUserTokenRefresh(userId, expiresAt);
      } catch (error) {
        console.warn(`[TeamsAuthService] Erro ao reagendar renovação automática: ${error.message}`);
      }

      console.log(`[TeamsAuthService] Access token renovado e atualizado no MySQL para usuário ${userId}`);
      return newTokens;
    } catch (error) {
      console.error(`[TeamsAuthService] Erro ao renovar access token: ${error.response?.data?.error_description || error.message}`);
      throw new Error(`Erro ao renovar token de acesso: ${error.response?.data?.error_description || error.message}`);
    }
  }

  // Obtém access token válido (renova se necessário)
  async getValidAccessToken(userId) {
    try {
      // Buscar tokens do cache ou banco
      let storedTokens = this.tokenCache.get(userId);

      if (!storedTokens) {
                const tokenRecord = await TeamsToken.findOne({
          where: { user_id: userId, is_active: true }
        });

        if (!tokenRecord) {
          throw new Error('Usuário não autenticado. Necessário realizar login.');
        }

        storedTokens = {
          accessToken: tokenRecord.access_token,
          refreshToken: tokenRecord.refresh_token,
          expiresAt: tokenRecord.expires_at,
          tokenType: tokenRecord.token_type,
          scope: tokenRecord.scope
        };

        // Carregar no cache
        this.tokenCache.set(userId, storedTokens);
      }

      // Verifica se o token expira nos próximos 5 minutos
      const fiveMinutesFromNow = new Date(Date.now() + (5 * 60 * 1000));

      if (storedTokens.expiresAt <= fiveMinutesFromNow) {
        console.log(`[TeamsAuthService] Token expirando em breve para usuário ${userId}, renovando...`);
        const newTokens = await this.refreshAccessToken(userId);
        return newTokens.accessToken;
      }

      return storedTokens.accessToken;
    } catch (error) {
      console.error(`[TeamsAuthService] Erro ao obter access token válido: ${error.message}`);
      throw error;
    }
  }

  // Verifica se usuário está autenticado
  async isUserAuthenticated(userId) {
    // Verificar cache primeiro
    const cachedTokens = this.tokenCache.get(userId);
    if (cachedTokens?.accessToken) {
      return true;
    }

    // Verificar no banco se não estiver no cache
    try {
            const tokenRecord = await TeamsToken.findOne({
        where: {
          user_id: userId,
          is_active: true,
          expires_at: {
            [Op.gt]: new Date()
          }
        }
      });

      if (tokenRecord) {
        // Carregar no cache para próximas consultas
        this.tokenCache.set(userId, {
          accessToken: tokenRecord.access_token,
          refreshToken: tokenRecord.refresh_token,
          expiresAt: tokenRecord.expires_at,
          tokenType: tokenRecord.token_type,
          scope: tokenRecord.scope
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error(`[TeamsAuthService] Erro ao verificar autenticação: ${error.message}`);
      return false;
    }
  }

  // Remove tokens do usuário (logout)
  async revokeUserTokens(userId) {
    try {
      // Remover do cache
      this.tokenCache.delete(userId);

      // Desativar no banco (soft delete)
      await TeamsToken.update({
        is_active: false
      }, {
        where: { user_id: userId, is_active: true }
      });

      console.log(`[TeamsAuthService] Tokens removidos do cache e desativados no MySQL para usuário ${userId}`);
      return true;
    } catch (error) {
      console.error(`[TeamsAuthService] Erro ao remover tokens: ${error.message}`);
      return false;
    }
  }

  // Obtém informações do usuário autenticado
  async getUserInfo(userId) {
    try {
      const accessToken = await this.getValidAccessToken(userId);

      const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`[TeamsAuthService] Informações do usuário obtidas: ${response.data.userPrincipalName}`);
      return response.data;
    } catch (error) {
      console.error(`[TeamsAuthService] Erro ao obter informações do usuário: ${error.response?.data?.error?.message || error.message}`);
      throw new Error(`Erro ao obter informações do usuário: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Verifica se o token está válido fazendo uma chamada simples
  async validateToken(userId) {
    try {
      await this.getUserInfo(userId);
      return true;
    } catch (error) {
      return false;
    }
  }
}

const teamsAuthService = new TeamsAuthService();
export default teamsAuthService;
