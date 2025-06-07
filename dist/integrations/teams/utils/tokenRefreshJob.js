"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _TeamsAuthService = require('../services/TeamsAuthService'); var _TeamsAuthService2 = _interopRequireDefault(_TeamsAuthService);
// DEPRECATED: Este arquivo foi substituído pelo sistema BullMQ
// Use teamsTokenRefreshQueue.js e teamsToken.worker.js

class TokenRefreshJob {
  constructor() {
    console.warn('[TokenRefreshJob] DEPRECATED: Use BullMQ queue system instead');
    this.intervalId = null;
    this.refreshIntervalMinutes = 30;
  }

  // Inicia o job de renovação automática
  start() {
    if (this.intervalId) {
      console.warn('[TokenRefreshJob] Job de renovação já está em execução');
      return;
    }

    console.log(`[TokenRefreshJob] Iniciando job de renovação automática de tokens (intervalo: ${this.refreshIntervalMinutes} minutos)`);

    this.intervalId = setInterval(() => {
      this.checkAndRefreshTokens();
    }, this.refreshIntervalMinutes * 60 * 1000);
  }

  // Para o job de renovação
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[TokenRefreshJob] Job de renovação automática parado');
    }
  }

  // Verifica e renova tokens que estão próximos do vencimento
  async checkAndRefreshTokens() {
    try {
      console.log('[TokenRefreshJob] Verificando tokens para renovação...');

      // Obtém todos os tokens em cache
      const tokenCache = _TeamsAuthService2.default.tokenCache;
      const usersToRefresh = [];

      // Verifica quais tokens precisam ser renovados (expiram em menos de 10 minutos)
      const tenMinutesFromNow = new Date(Date.now() + (10 * 60 * 1000));

      for (const [userId, tokens] of tokenCache.entries()) {
        if (tokens.expiresAt <= tenMinutesFromNow) {
          usersToRefresh.push(userId);
        }
      }

      if (usersToRefresh.length === 0) {
        console.log('[TokenRefreshJob] Nenhum token precisa ser renovado no momento');
        return;
      }

      console.log(`[TokenRefreshJob] Renovando tokens para ${usersToRefresh.length} usuários`);

      // Renova tokens em paralelo
      const refreshPromises = usersToRefresh.map(async (userId) => {
        try {
          await _TeamsAuthService2.default.refreshAccessToken(userId);
          console.log(`[TokenRefreshJob] Token renovado com sucesso para usuário ${userId}`);
          return { userId, success: true };
        } catch (error) {
          console.error(`[TokenRefreshJob] Erro ao renovar token para usuário ${userId}: ${error.message}`);

          // Se o refresh token também expirou, remove o usuário do cache
          if (error.message.includes('invalid_grant') || error.message.includes('expired')) {
            _TeamsAuthService2.default.revokeUserTokens(userId);
            console.warn(`[TokenRefreshJob] Usuário ${userId} removido do cache - refresh token expirado`);
          }

          return { userId, success: false, error: error.message };
        }
      });

      const results = await Promise.allSettled(refreshPromises);

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - successful;

      console.log(`[TokenRefreshJob] Renovação concluída: ${successful} sucessos, ${failed} falhas`);

    } catch (error) {
      console.error(`[TokenRefreshJob] Erro crítico no job de renovação: ${error.message}`);
    }
  }

  // Força renovação para um usuário específico
  async forceRefreshUser(userId) {
    try {
      console.log(`[TokenRefreshJob] Forçando renovação de token para usuário ${userId}`);
      await _TeamsAuthService2.default.refreshAccessToken(userId);
      console.log(`[TokenRefreshJob] Token renovado com sucesso para usuário ${userId}`);
      return true;
    } catch (error) {
      console.error(`[TokenRefreshJob] Erro ao forçar renovação para usuário ${userId}: ${error.message}`);
      return false;
    }
  }

  // Obtém estatísticas dos tokens
  getTokenStats() {
    const tokenCache = _TeamsAuthService2.default.tokenCache;
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + (60 * 60 * 1000));
    const oneDayFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));

    let total = 0;
    let expiringSoon = 0; // Expira em menos de 1 hora
    let expiringToday = 0; // Expira em menos de 24 horas
    let expired = 0;

    for (const [userId, tokens] of tokenCache.entries()) {
      total++;

      if (tokens.expiresAt <= now) {
        expired++;
      } else if (tokens.expiresAt <= oneHourFromNow) {
        expiringSoon++;
      } else if (tokens.expiresAt <= oneDayFromNow) {
        expiringToday++;
      }
    }

    return {
      total,
      expired,
      expiringSoon,
      expiringToday,
      healthy: total - expired - expiringSoon - expiringToday
    };
  }

  // Limpa tokens expirados do cache
  cleanupExpiredTokens() {
    try {
      const tokenCache = _TeamsAuthService2.default.tokenCache;
      const now = new Date();
      const expiredUsers = [];

      for (const [userId, tokens] of tokenCache.entries()) {
        // Remove tokens expirados há mais de 1 dia
        const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        if (tokens.expiresAt <= oneDayAgo) {
          expiredUsers.push(userId);
        }
      }

      expiredUsers.forEach(userId => {
        _TeamsAuthService2.default.revokeUserTokens(userId);
      });

      if (expiredUsers.length > 0) {
        console.log(`[TokenRefreshJob] Removidos ${expiredUsers.length} tokens expirados do cache`);
      }

      return expiredUsers.length;
    } catch (error) {
      console.error(`[TokenRefreshJob] Erro ao limpar tokens expirados: ${error.message}`);
      return 0;
    }
  }
}

const tokenRefreshJob = new TokenRefreshJob();
exports. default = tokenRefreshJob;
