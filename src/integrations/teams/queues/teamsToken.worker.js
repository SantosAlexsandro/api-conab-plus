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
    // Correção: adicionar await para o método async isUserAuthenticated
    const isAuthenticated = await TeamsAuthService.isUserAuthenticated(userId);

    if (!isAuthenticated) {
      console.log(`[TeamsTokenWorker] Usuário ${userId} não autenticado ou token expirado`);
      return { success: false, reason: 'not_authenticated' };
    }

    // Como removemos o cache, vamos buscar diretamente do banco para verificar expiração
    console.log(`[TeamsTokenWorker] Usuário ${userId} autenticado, iniciando renovação do token`);

    const newTokens = await TeamsAuthService.refreshAccessToken(userId);
    console.log(`[TeamsTokenWorker] Token renovado com sucesso para usuário ${userId}`);

    return { success: true, expiresAt: newTokens.expiresAt };

  } catch (error) {
    console.error(`[TeamsTokenWorker] Erro ao renovar token para usuário ${userId}:`, error.message);

    if (error.message.includes('invalid_grant') || error.message.includes('expired')) {
      await TeamsAuthService.revokeUserTokens(userId);
      console.log(`[TeamsTokenWorker] Usuário ${userId} removido - refresh token expirado`);
    }

    throw error;
  }
}

// Processa verificação e renovação de todos os usuários
async function processRefreshAllUsers(job) {
  try {
    // Como removemos o cache, vamos buscar todos os tokens ativos do banco
    const TeamsToken = (await import('../../models/TeamsToken.js')).default;
    const activeTokens = await TeamsToken.findAll({
      where: { is_active: true },
      attributes: ['user_id', 'expires_at']
    });

    const results = [];
    const tenMinutesFromNow = new Date(Date.now() + (10 * 60 * 1000));

    for (const token of activeTokens) {
      const { user_id: userId, expires_at: expiresAt } = token;

      if (new Date(expiresAt) <= tenMinutesFromNow) {
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
    // Como removemos o cache, vamos buscar tokens expirados do banco
    const TeamsToken = (await import('../../models/TeamsToken.js')).default;
    const { Op } = await import('sequelize');

    const oneDayAgo = new Date(Date.now() - (24 * 60 * 60 * 1000));

    // Buscar tokens expirados há mais de 1 dia
    const expiredTokens = await TeamsToken.findAll({
      where: {
        is_active: true,
        expires_at: { [Op.lte]: oneDayAgo }
      },
      attributes: ['user_id']
    });

    const expiredUsers = [];

    for (const token of expiredTokens) {
      const userId = token.user_id;
      await TeamsAuthService.revokeUserTokens(userId);
      expiredUsers.push(userId);
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
