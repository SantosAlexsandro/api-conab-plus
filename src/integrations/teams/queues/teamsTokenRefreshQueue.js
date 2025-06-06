import { Queue, Worker } from 'bullmq';
import redisConnection from '../../g4flex/queues/redis.js';
import TeamsAuthService from '../services/TeamsAuthService.js';

// Queue para renovação de tokens
export const teamsTokenQueue = new Queue('teams-token-refresh', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 10, // Manter apenas os últimos 10 jobs completados
    removeOnFail: 20,     // Manter os últimos 20 jobs falhados para debug
    attempts: 3,          // Tentar 3 vezes antes de falhar
    backoff: {
      type: 'exponential',
      delay: 2000,        // Delay inicial de 2 segundos
    },
  },
});

// Worker para processar renovação de tokens
export const teamsTokenWorker = new Worker(
  'teams-token-refresh',
  async (job) => {
    const { type, userId } = job.data;

    console.log(`[TeamsTokenWorker] Processando job: ${type} para usuário ${userId || 'todos'}`);

    try {
      switch (type) {
        case 'refresh-single-user':
          return await refreshSingleUser(userId);

        case 'refresh-all-users':
          return await refreshAllUsers();

        case 'cleanup-expired':
          return await cleanupExpiredTokens();

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
    concurrency: 5, // Processar até 5 jobs simultaneamente
  }
);

// Função para renovar token de um usuário específico
async function refreshSingleUser(userId) {
  try {
    const isAuthenticated = TeamsAuthService.isUserAuthenticated(userId);

    if (!isAuthenticated) {
      console.log(`[TeamsTokenWorker] Usuário ${userId} não autenticado, removendo jobs agendados`);
      await cancelUserRefreshJobs(userId);
      return { success: false, reason: 'not_authenticated' };
    }

    // Verificar se precisa renovar (expira em menos de 15 minutos)
    const tokenInfo = TeamsAuthService.tokenCache.get(userId);

    if (!tokenInfo) {
      console.log(`[TeamsTokenWorker] Token não encontrado no cache para usuário ${userId}, carregando do banco...`);
      // Força recarregar do banco para o cache
      await TeamsAuthService.getValidAccessToken(userId);
      const reloadedToken = TeamsAuthService.tokenCache.get(userId);

      if (!reloadedToken) {
        console.log(`[TeamsTokenWorker] Falha ao carregar token do banco para usuário ${userId}`);
        return { success: false, reason: 'token_not_found' };
      }

      // Continuar com token recarregado
      const tokenToCheck = reloadedToken;
      const fifteenMinutesFromNow = new Date(Date.now() + (15 * 60 * 1000));

      if (tokenToCheck.expiresAt > fifteenMinutesFromNow) {
        console.log(`[TeamsTokenWorker] Token do usuário ${userId} ainda válido por mais de 15 minutos`);
        return { success: true, reason: 'token_still_valid' };
      }
    } else {
      const fifteenMinutesFromNow = new Date(Date.now() + (15 * 60 * 1000));

      if (tokenInfo.expiresAt > fifteenMinutesFromNow) {
        console.log(`[TeamsTokenWorker] Token do usuário ${userId} ainda válido por mais de 15 minutos`);
        return { success: true, reason: 'token_still_valid' };
      }
    }

    // Renovar token
    const newTokens = await TeamsAuthService.refreshAccessToken(userId);

    // Reagendar próxima renovação
    await scheduleUserTokenRefresh(userId, newTokens.expiresAt);

    console.log(`[TeamsTokenWorker] Token renovado com sucesso para usuário ${userId}`);
    return {
      success: true,
      expiresAt: newTokens.expiresAt,
      nextRefreshScheduled: true
    };

  } catch (error) {
    console.error(`[TeamsTokenWorker] Erro ao renovar token para usuário ${userId}:`, error.message);

    // Se refresh token expirou, remove do cache e cancela jobs
    if (error.message.includes('invalid_grant') || error.message.includes('expired')) {
      TeamsAuthService.revokeUserTokens(userId);
      await cancelUserRefreshJobs(userId);
      console.log(`[TeamsTokenWorker] Usuário ${userId} removido - refresh token expirado`);
    }

    throw error;
  }
}

// Função para renovar tokens de todos os usuários
async function refreshAllUsers() {
  try {
    const tokenCache = TeamsAuthService.tokenCache;
    const results = [];

    console.log(`[TeamsTokenWorker] Verificando ${tokenCache.size} usuários para renovação`);

    for (const [userId, tokenInfo] of tokenCache.entries()) {
      try {
        // Verificar se precisa renovar (expira em menos de 10 minutos)
        const tenMinutesFromNow = new Date(Date.now() + (10 * 60 * 1000));

        if (tokenInfo.expiresAt <= tenMinutesFromNow) {
          // Agendar renovação individual
          await teamsTokenQueue.add('refresh-single-user', {
            type: 'refresh-single-user',
            userId
          }, {
            priority: 10, // Alta prioridade para tokens expirando
            delay: 0,     // Executar imediatamente
          });

          results.push({ userId, action: 'scheduled_refresh' });
        } else {
          results.push({ userId, action: 'token_valid' });
        }
      } catch (error) {
        console.error(`[TeamsTokenWorker] Erro ao verificar usuário ${userId}:`, error.message);
        results.push({ userId, action: 'error', error: error.message });
      }
    }

    console.log(`[TeamsTokenWorker] Verificação completa: ${results.length} usuários processados`);
    return { totalUsers: results.length, results };

  } catch (error) {
    console.error('[TeamsTokenWorker] Erro na renovação em lote:', error.message);
    throw error;
  }
}

// Função para limpar tokens expirados
async function cleanupExpiredTokens() {
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

    // Remover tokens expirados e cancelar jobs
    for (const userId of expiredUsers) {
      TeamsAuthService.revokeUserTokens(userId);
      await cancelUserRefreshJobs(userId);
    }

    console.log(`[TeamsTokenWorker] Limpeza concluída: ${expiredUsers.length} tokens expirados removidos`);
    return { cleanedUsers: expiredUsers.length, userIds: expiredUsers };

  } catch (error) {
    console.error('[TeamsTokenWorker] Erro na limpeza:', error.message);
    throw error;
  }
}

// Função para agendar renovação de token para usuário específico
export async function scheduleUserTokenRefresh(userId, expiresAt) {
  try {
    // Cancelar jobs existentes para este usuário
    await cancelUserRefreshJobs(userId);

    // Calcular delay (renovar 10 minutos antes do vencimento)
    const refreshTime = new Date(expiresAt.getTime() - (10 * 60 * 1000));
    const delay = Math.max(0, refreshTime.getTime() - Date.now());

    // Agendar novo job
    const job = await teamsTokenQueue.add(
      'refresh-single-user',
      {
        type: 'refresh-single-user',
        userId,
        scheduledFor: refreshTime.toISOString()
      },
      {
        delay,
        jobId: `refresh-${userId}`, // ID único para permitir cancelamento
      }
    );

    console.log(`[TeamsTokenQueue] Renovação agendada para usuário ${userId} em ${refreshTime.toISOString()}`);
    return job;

  } catch (error) {
    console.error(`[TeamsTokenQueue] Erro ao agendar renovação para usuário ${userId}:`, error.message);
    throw error;
  }
}

// Função para cancelar jobs de renovação de um usuário
export async function cancelUserRefreshJobs(userId) {
  try {
    const jobId = `refresh-${userId}`;

    // Tentar remover job agendado
    const job = await teamsTokenQueue.getJob(jobId);
    if (job) {
      await job.remove();
      console.log(`[TeamsTokenQueue] Job cancelado para usuário ${userId}`);
    }

    return true;
  } catch (error) {
    console.error(`[TeamsTokenQueue] Erro ao cancelar jobs para usuário ${userId}:`, error.message);
    return false;
  }
}

// Função para agendar verificação periódica de todos os usuários
export async function schedulePeriodicRefresh() {
  try {
    // Remover job existente se houver
    await teamsTokenQueue.removeRepeatable('refresh-all-users', {
      pattern: '*/30 * * * *', // A cada 30 minutos
    });

    // Agendar nova verificação periódica
    await teamsTokenQueue.add(
      'refresh-all-users',
      { type: 'refresh-all-users' },
      {
        repeat: {
          pattern: '*/30 * * * *', // A cada 30 minutos (cron)
        },
        jobId: 'periodic-refresh',
      }
    );

    console.log('[TeamsTokenQueue] Verificação periódica agendada (a cada 30 minutos)');

    // Agendar limpeza diária
    await teamsTokenQueue.add(
      'cleanup-expired',
      { type: 'cleanup-expired' },
      {
        repeat: {
          pattern: '0 2 * * *', // Todo dia às 2:00 AM
        },
        jobId: 'daily-cleanup',
      }
    );

    console.log('[TeamsTokenQueue] Limpeza diária agendada (2:00 AM)');

  } catch (error) {
    console.error('[TeamsTokenQueue] Erro ao agendar verificação periódica:', error.message);
    throw error;
  }
}

// Event listeners para monitoramento
teamsTokenWorker.on('completed', (job, result) => {
  console.log(`[TeamsTokenWorker] Job ${job.id} completado:`, result);
});

teamsTokenWorker.on('failed', (job, err) => {
  console.error(`[TeamsTokenWorker] Job ${job?.id} falhou:`, err.message);
});

teamsTokenWorker.on('error', (err) => {
  console.error('[TeamsTokenWorker] Erro no worker:', err.message);
});

// Função para obter estatísticas da queue
export async function getQueueStats() {
  const waiting = await teamsTokenQueue.getWaiting();
  const active = await teamsTokenQueue.getActive();
  const completed = await teamsTokenQueue.getCompleted();
  const failed = await teamsTokenQueue.getFailed();

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
    totalJobs: waiting.length + active.length + completed.length + failed.length
  };
}

export default {
  queue: teamsTokenQueue,
  worker: teamsTokenWorker,
  scheduleUserTokenRefresh,
  cancelUserRefreshJobs,
  schedulePeriodicRefresh,
  getQueueStats,
};
