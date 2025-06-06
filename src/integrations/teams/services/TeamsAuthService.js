import axios from 'axios';
// Removido import do logEvent para usar console.log/error diretamente

class TeamsAuthService {
  constructor() {
    this.clientId = process.env.TEAMS_CLIENT_ID;
    this.clientSecret = process.env.TEAMS_CLIENT_SECRET;
    this.tenantId = process.env.TEAMS_TENANT_ID;
    this.redirectUri = process.env.TEAMS_REDIRECT_URI;
    this.scope = 'https://graph.microsoft.com/User.Read https://graph.microsoft.com/Chat.ReadWrite https://graph.microsoft.com/ChatMessage.Send https://graph.microsoft.com/offline_access';
    this.baseUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0`;

    // Cache para tokens em memória (em produção considere usar Redis)
    this.tokenCache = new Map();
  }

  // Gera URL de autorização para o usuário
  generateAuthUrl(userId, state = null) {
    try {
      const params = new URLSearchParams({
        client_id: this.clientId,
        response_type: 'code',
        redirect_uri: this.redirectUri,
        response_mode: 'query',
        scope: this.scope,
        state: state || userId,
      });

      const authUrl = `${this.baseUrl}/authorize?${params.toString()}`;

      console.log(`[TeamsAuthService] URL de autorização gerada para usuário ${userId}`);
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

      const tokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,
        scope: response.data.scope,
        expiresAt: new Date(Date.now() + (response.data.expires_in * 1000))
      };

      // Armazena tokens no cache
      this.tokenCache.set(userId, tokens);

      // Agendar renovação automática usando BullMQ
      try {
        const { scheduleUserTokenRefresh } = await import('../queues/teamsTokenRefreshQueue.js');
        await scheduleUserTokenRefresh(userId, tokens.expiresAt);
      } catch (error) {
        console.warn(`[TeamsAuthService] Erro ao agendar renovação automática: ${error.message}`);
      }

      console.log(`[TeamsAuthService] Tokens obtidos com sucesso para usuário ${userId}`);
      return tokens;
    } catch (error) {
      console.error(`[TeamsAuthService] Erro ao trocar código por tokens: ${error.response?.data?.error_description || error.message}`);
      throw new Error(`Erro ao obter tokens de acesso: ${error.response?.data?.error_description || error.message}`);
    }
  }

  // Renova access token usando refresh token
  async refreshAccessToken(userId) {
    try {
      const cachedTokens = this.tokenCache.get(userId);
      if (!cachedTokens?.refreshToken) {
        throw new Error('Refresh token não encontrado para o usuário');
      }

      const tokenData = {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: this.scope,
        refresh_token: cachedTokens.refreshToken,
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

      const newTokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || cachedTokens.refreshToken, // Mantém o antigo se não vier novo
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,
        scope: response.data.scope,
        expiresAt: new Date(Date.now() + (response.data.expires_in * 1000))
      };

      // Atualiza tokens no cache
      this.tokenCache.set(userId, newTokens);

      // Reagendar próxima renovação usando BullMQ
      try {
        const { scheduleUserTokenRefresh } = await import('../queues/teamsTokenRefreshQueue.js');
        await scheduleUserTokenRefresh(userId, newTokens.expiresAt);
      } catch (error) {
        console.warn(`[TeamsAuthService] Erro ao reagendar renovação automática: ${error.message}`);
      }

      console.log(`[TeamsAuthService] Access token renovado para usuário ${userId}`);
      return newTokens;
    } catch (error) {
      console.error(`[TeamsAuthService] Erro ao renovar access token: ${error.response?.data?.error_description || error.message}`);
      throw new Error(`Erro ao renovar token de acesso: ${error.response?.data?.error_description || error.message}`);
    }
  }

  // Obtém access token válido (renova se necessário)
  async getValidAccessToken(userId) {
    try {
      const cachedTokens = this.tokenCache.get(userId);

      if (!cachedTokens) {
        throw new Error('Usuário não autenticado. Necessário realizar login.');
      }

      // Verifica se o token expira nos próximos 5 minutos
      const fiveMinutesFromNow = new Date(Date.now() + (5 * 60 * 1000));

      if (cachedTokens.expiresAt <= fiveMinutesFromNow) {
        console.log(`[TeamsAuthService] Token expirando em breve para usuário ${userId}, renovando...`);
        const newTokens = await this.refreshAccessToken(userId);
        return newTokens.accessToken;
      }

      return cachedTokens.accessToken;
    } catch (error) {
      console.error(`[TeamsAuthService] Erro ao obter access token válido: ${error.message}`);
      throw error;
    }
  }

  // Verifica se usuário está autenticado
  isUserAuthenticated(userId) {
    const cachedTokens = this.tokenCache.get(userId);
    return !!cachedTokens?.accessToken;
  }

  // Remove tokens do usuário (logout)
  revokeUserTokens(userId) {
    try {
      this.tokenCache.delete(userId);
      console.log(`[TeamsAuthService] Tokens removidos para usuário ${userId}`);
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
