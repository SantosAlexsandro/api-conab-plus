"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// src/integrations/teams/queues/teamsToken.worker.js

// Worker para processamento de renovação automática de tokens do Microsoft Teams
// Utiliza BullMQ para garantir execução robusta e resiliente de renovação de tokens

var _bullmq = require('bullmq');
var _redisjs = require('../../g4flex/queues/redis.js'); var _redisjs2 = _interopRequireDefault(_redisjs);
var _TeamsAuthServicejs = require('../services/TeamsAuthService.js'); var _TeamsAuthServicejs2 = _interopRequireDefault(_TeamsAuthServicejs);
var _teamsTokenRefreshQueuejs = require('./teamsTokenRefreshQueue.js');

const TIMEZONE_BRASILIA = 'America/Sao_Paulo';

// Função para gerar data no fuso horário do Brasil
function generateDateInBrazilTimezone(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIMEZONE_BRASILIA,
    dateStyle: 'short',
    timeStyle: 'medium'
  }).format(date);
}

// Worker para processar renovação de tokens
const teamsTokenWorker = new (0, _bullmq.Worker)(
  'teams-token-refresh',
  async (job) => {
    const { type, userId } = job.data;
    console.log(`[TeamsTokenWorker] Processando job: ${type} para usuário ${userId || 'todos'}`);

    try {
      switch (type) {
        case 'refresh-single-user':
          return await processRefreshSingleUser(job);
        case 'refresh-all-users':
          return await processRefreshAllUsers(job);
        case 'cleanup-expired':
          return await processCleanupExpired(job);
        default:
          throw new Error(`Tipo de job desconhecido: ${type}`);
      }
    } catch (error) {
      console.error(`[TeamsTokenWorker] Erro no job ${type}:`, error.message);
      throw error;
    }
  },
  {
    connection: _redisjs2.default,
    concurrency: 3,
  }
);

// Processa renovação de token para usuário específico
async function processRefreshSingleUser(job) {
  const { userId } = job.data;

  try {
    const isAuthenticated = _TeamsAuthServicejs2.default.isUserAuthenticated(userId);

    if (!isAuthenticated) {
      console.log(`[TeamsTokenWorker] Usuário ${userId} não autenticado`);
      return { success: false, reason: 'not_authenticated' };
    }

    const tokenInfo = _TeamsAuthServicejs2.default.tokenCache.get(userId);
    const fifteenMinutesFromNow = new Date(Date.now() + (15 * 60 * 1000));

    if (tokenInfo.expiresAt > fifteenMinutesFromNow) {
      return { success: true, reason: 'token_still_valid' };
    }

    const newTokens = await _TeamsAuthServicejs2.default.refreshAccessToken(userId);
    console.log(`[TeamsTokenWorker] Token renovado para usuário ${userId}`);

    return { success: true, expiresAt: newTokens.expiresAt };

  } catch (error) {
    console.error(`[TeamsTokenWorker] Erro ao renovar token para usuário ${userId}:`, error.message);

    if (error.message.includes('invalid_grant') || error.message.includes('expired')) {
      _TeamsAuthServicejs2.default.revokeUserTokens(userId);
      console.log(`[TeamsTokenWorker] Usuário ${userId} removido - refresh token expirado`);
    }

    throw error;
  }
}

// Processa verificação e renovação de todos os usuários
async function processRefreshAllUsers(job) {
  try {
    const tokenCache = _TeamsAuthServicejs2.default.tokenCache;
    const results = [];

    for (const [userId, tokenInfo] of tokenCache.entries()) {
      const tenMinutesFromNow = new Date(Date.now() + (10 * 60 * 1000));

      if (tokenInfo.expiresAt <= tenMinutesFromNow) {
        await _teamsTokenRefreshQueuejs.teamsTokenQueue.add('refresh-single-user', {
          type: 'refresh-single-user',
          userId
        }, { priority: 10 });

        results.push({ userId, action: 'scheduled_refresh' });
      } else {
        results.push({ userId, action: 'token_valid' });
      }
    }

    return { totalUsers: results.length, results };

  } catch (error) {
    console.error('[TeamsTokenWorker] Erro na verificação em lote:', error.message);
    throw error;
  }
}

// Processa limpeza de tokens expirados
async function processCleanupExpired(job) {
  try {
    const tokenCache = _TeamsAuthServicejs2.default.tokenCache;
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const expiredUsers = [];

    for (const [userId, tokenInfo] of tokenCache.entries()) {
      if (tokenInfo.expiresAt <= oneDayAgo) {
        expiredUsers.push(userId);
      }
    }

    for (const userId of expiredUsers) {
      _TeamsAuthServicejs2.default.revokeUserTokens(userId);
    }

    console.log(`[TeamsTokenWorker] Limpeza: ${expiredUsers.length} tokens expirados removidos`);
    return { cleanedUsers: expiredUsers.length };

  } catch (error) {
    console.error('[TeamsTokenWorker] Erro na limpeza:', error.message);
    throw error;
  }
}

// Event listeners para monitoramento
teamsTokenWorker.on('completed', (job, result) => {
  console.log(`[TeamsTokenWorker] Job ${job.id} completado`);
});

teamsTokenWorker.on('failed', (job, err) => {
  console.error(`[TeamsTokenWorker] Job ${_optionalChain([job, 'optionalAccess', _ => _.id])} falhou:`, err.message);
});

console.log('Teams Token Worker iniciado...');

exports. default = teamsTokenWorker;
