// src/integrations/teams/queues/teamsToken.worker.js

// Worker para processamento de renovação automática de tokens do Microsoft Teams
// Utiliza BullMQ para garantir execução robusta e resiliente de renovação de tokens

import { Worker } from 'bullmq';
import redisConnection from '../../g4flex/queues/redis.js';
import TeamsAuthService from '../services/TeamsAuthService.js';
import { teamsTokenQueue } from './teamsTokenRefreshQueue.js';

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
const teamsTokenWorker = new Worker(
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
    connection: redisConnection,
    concurrency: 3,
  }
);

// Processa renovação de token para usuário específico
async function processRefreshSingleUser(job) {
  const { userId } = job.data;

  try {
    const isAuthenticated = TeamsAuthService.isUserAuthenticated(userId);

    if (!isAuthenticated) {
      console.log(`[TeamsTokenWorker] Usuário ${userId} não autenticado`);
      return { success: false, reason: 'not_authenticated' };
    }

    const tokenInfo = TeamsAuthService.tokenCache.get(userId);
    const fifteenMinutesFromNow = new Date(Date.now() + (15 * 60 * 1000));

    if (tokenInfo.expiresAt > fifteenMinutesFromNow) {
      return { success: true, reason: 'token_still_valid' };
    }

    const newTokens = await TeamsAuthService.refreshAccessToken(userId);
    console.log(`[TeamsTokenWorker] Token renovado para usuário ${userId}`);

    return { success: true, expiresAt: newTokens.expiresAt };

  } catch (error) {
    console.error(`[TeamsTokenWorker] Erro ao renovar token para usuário ${userId}:`, error.message);

    if (error.message.includes('invalid_grant') || error.message.includes('expired')) {
      TeamsAuthService.revokeUserTokens(userId);
      console.log(`[TeamsTokenWorker] Usuário ${userId} removido - refresh token expirado`);
    }

    throw error;
  }
}

// Processa verificação e renovação de todos os usuários
async function processRefreshAllUsers(job) {
  try {
    const tokenCache = TeamsAuthService.tokenCache;
    const results = [];

    for (const [userId, tokenInfo] of tokenCache.entries()) {
      const tenMinutesFromNow = new Date(Date.now() + (10 * 60 * 1000));

      if (tokenInfo.expiresAt <= tenMinutesFromNow) {
        await teamsTokenQueue.add('refresh-single-user', {
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
    const tokenCache = TeamsAuthService.tokenCache;
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const expiredUsers = [];

    for (const [userId, tokenInfo] of tokenCache.entries()) {
      if (tokenInfo.expiresAt <= oneDayAgo) {
        expiredUsers.push(userId);
      }
    }

    for (const userId of expiredUsers) {
      TeamsAuthService.revokeUserTokens(userId);
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
  console.error(`[TeamsTokenWorker] Job ${job?.id} falhou:`, err.message);
});

console.log('Teams Token Worker iniciado...');

export default teamsTokenWorker;
