"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _TeamsTokenjs = require('../../../models/TeamsToken.js'); var _TeamsTokenjs2 = _interopRequireDefault(_TeamsTokenjs);
var _sequelize = require('sequelize');

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

      const response = await _axios2.default.post(`${this.baseUrl}/token`,
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
        const [instance, created] = await _TeamsTokenjs2.default.upsert({
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
        const { scheduleUserTokenRefresh } = await Promise.resolve().then(() => require('../queues/teamsTokenRefreshQueue.js'));
        await scheduleUserTokenRefresh(userId, expiresAt);
      } catch (error) {
        console.warn(`[TeamsAuthService] Erro ao agendar renovação automática: ${error.message}`);
      }

      console.log(`[TeamsAuthService] Tokens obtidos e persistidos no MySQL para usuário ${userId}`);
      return tokens;
    } catch (error) {
      console.error(`[TeamsAuthService] Erro ao trocar código por tokens: ${_optionalChain([error, 'access', _ => _.response, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.error_description]) || error.message}`);
      throw new Error(`Erro ao obter tokens de acesso: ${_optionalChain([error, 'access', _4 => _4.response, 'optionalAccess', _5 => _5.data, 'optionalAccess', _6 => _6.error_description]) || error.message}`);
    }
  }

  // Renova access token usando refresh token
  async refreshAccessToken(userId) {
    try {
      // Buscar tokens do cache ou banco
      let storedTokens = this.tokenCache.get(userId);

      if (!storedTokens) {
                const tokenRecord = await _TeamsTokenjs2.default.findOne({
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

      if (!_optionalChain([storedTokens, 'optionalAccess', _7 => _7.refreshToken])) {
        throw new Error('Refresh token não encontrado para o usuário');
      }

      // Validar refresh token antes de enviar
      if (typeof storedTokens.refreshToken !== 'string' || storedTokens.refreshToken.trim() === '') {
        throw new Error('Refresh token inválido ou corrompido');
      }

      const tokenData = {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: storedTokens.refreshToken.trim(),
        grant_type: 'refresh_token'
        // Nota: scope removido intencionalmente para refresh - usa o escopo original do token
      };

      console.log(`[TeamsAuthService] Fazendo requisição refresh para: ${this.baseUrl}/token`);
      console.log(`[TeamsAuthService] Client ID: ${this.clientId}`);
      console.log(`[TeamsAuthService] Grant type: ${tokenData.grant_type}`);
      console.log(`[TeamsAuthService] Refresh token length: ${storedTokens.refreshToken.length}`);

      const response = await _axios2.default.post(`${this.baseUrl}/token`,
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
      await _TeamsTokenjs2.default.update({
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token || storedTokens.refreshToken,
        token_type: response.data.token_type,
        scope: response.data.scope,
        expires_at: expiresAt,
        expires_in: response.data.expires_in
      }, {
        where: { user_id: userId, is_active: true }
      });

      // Cache removido temporariamente para debug

      // Reagendar próxima renovação usando BullMQ
      try {
        const { scheduleUserTokenRefresh } = await Promise.resolve().then(() => require('../queues/teamsTokenRefreshQueue.js'));
        await scheduleUserTokenRefresh(userId, expiresAt);
      } catch (error) {
        console.warn(`[TeamsAuthService] Erro ao reagendar renovação automática: ${error.message}`);
      }

      console.log(`[TeamsAuthService] Access token renovado e atualizado no MySQL para usuário ${userId}`);
      return newTokens;
    } catch (error) {
      console.error(`[TeamsAuthService] Erro ao renovar access token: ${_optionalChain([error, 'access', _8 => _8.response, 'optionalAccess', _9 => _9.data, 'optionalAccess', _10 => _10.error_description]) || error.message}`);
      throw new Error(`Erro ao renovar token de acesso: ${_optionalChain([error, 'access', _11 => _11.response, 'optionalAccess', _12 => _12.data, 'optionalAccess', _13 => _13.error_description]) || error.message}`);
    }
  }

  // Obtém access token válido (renova se necessário) - SEM CACHE
  async getValidAccessToken(userId) {
    try {
      console.log(`[TeamsAuthService] Buscando token do banco para usuário: ${userId}`);

      // Buscar sempre do banco (sem cache)
      const tokenRecord = await _TeamsTokenjs2.default.findOne({
        where: { user_id: userId, is_active: true }
      });

      if (!tokenRecord) {
        throw new Error('Usuário não autenticado. Necessário realizar login.');
      }

      console.log(`[TeamsAuthService] Token encontrado no banco. Expira em: ${tokenRecord.expires_at}`);

      const storedTokens = {
        accessToken: tokenRecord.access_token,
        refreshToken: tokenRecord.refresh_token,
        expiresAt: tokenRecord.expires_at,
        tokenType: tokenRecord.token_type,
        scope: tokenRecord.scope
      };

      // Verifica se o token expira nos próximos 5 minutos
      const fiveMinutesFromNow = new Date(Date.now() + (5 * 60 * 1000));

      if (storedTokens.expiresAt <= fiveMinutesFromNow) {
        console.log(`[TeamsAuthService] Token expirando em breve para usuário ${userId}, renovando...`);
        const newTokens = await this.refreshAccessToken(userId);
        return newTokens.accessToken;
      }

      console.log(`[TeamsAuthService] Token válido retornado para usuário ${userId}`);
      return storedTokens.accessToken;
    } catch (error) {
      console.error(`[TeamsAuthService] Erro ao obter access token válido: ${error.message}`);
      throw error;
    }
  }

  // Verifica se usuário está autenticado - SEM CACHE
  async isUserAuthenticated(userId) {
    try {
      console.log(`[TeamsAuthService] Verificando autenticação no banco para usuário: ${userId}`);

      // Verificar sempre no banco (sem cache)
      const tokenRecord = await _TeamsTokenjs2.default.findOne({
        where: {
          user_id: userId,
          is_active: true,
          expires_at: {
            [_sequelize.Op.gt]: new Date()
          }
        }
      });

      const isAuthenticated = !!tokenRecord;
      console.log(`[TeamsAuthService] Resultado autenticação para ${userId}: ${isAuthenticated ? '✅ Autenticado' : '❌ Não autenticado'}`);

      if (tokenRecord) {
        console.log(`[TeamsAuthService] Token expira em: ${tokenRecord.expires_at}`);
      }

      return isAuthenticated;
    } catch (error) {
      console.error(`[TeamsAuthService] Erro ao verificar autenticação: ${error.message}`);
      return false;
    }
  }

  // Remove tokens do usuário (logout) - SEM CACHE
  async revokeUserTokens(userId) {
    try {
      // Desativar no banco (soft delete)
      await _TeamsTokenjs2.default.update({
        is_active: false
      }, {
        where: { user_id: userId, is_active: true }
      });

      console.log(`[TeamsAuthService] Tokens desativados no MySQL para usuário ${userId}`);
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

      const response = await _axios2.default.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`[TeamsAuthService] Informações do usuário obtidas: ${response.data.userPrincipalName}`);
      return response.data;
    } catch (error) {
      console.error(`[TeamsAuthService] Erro ao obter informações do usuário: ${_optionalChain([error, 'access', _14 => _14.response, 'optionalAccess', _15 => _15.data, 'optionalAccess', _16 => _16.error, 'optionalAccess', _17 => _17.message]) || error.message}`);
      throw new Error(`Erro ao obter informações do usuário: ${_optionalChain([error, 'access', _18 => _18.response, 'optionalAccess', _19 => _19.data, 'optionalAccess', _20 => _20.error, 'optionalAccess', _21 => _21.message]) || error.message}`);
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

exports. default = TeamsAuthService;
