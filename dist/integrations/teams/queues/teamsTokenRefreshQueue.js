"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _bullmq = require('bullmq');
var _redisjs = require('../../g4flex/queues/redis.js'); var _redisjs2 = _interopRequireDefault(_redisjs);
var _TeamsAuthServicejs = require('../services/TeamsAuthService.js'); var _TeamsAuthServicejs2 = _interopRequireDefault(_TeamsAuthServicejs);
var _TeamsTokenjs = require('../../../models/TeamsToken.js'); var _TeamsTokenjs2 = _interopRequireDefault(_TeamsTokenjs);
var _sequelize = require('sequelize');

// Queue para renovação de tokens
 const teamsTokenQueue = new (0, _bullmq.Queue)('teams-token-refresh', {
  connection: _redisjs2.default,
  defaultJobOptions: {
    removeOnComplete: 10, // Manter apenas os últimos 10 jobs completados
    removeOnFail: 20,     // Manter os últimos 20 jobs falhados para debug
    attempts: 3,          // Tentar 3 vezes antes de falhar
    backoff: {
      type: 'exponential',
      delay: 2000,        // Delay inicial de 2 segundos
    },
  },
}); exports.teamsTokenQueue = teamsTokenQueue;

// Worker para processar renovação de tokens
 const teamsTokenWorker = new (0, _bullmq.Worker)(
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
    connection: _redisjs2.default,
    concurrency: 5, // Processar até 5 jobs simultaneamente
  }
); exports.teamsTokenWorker = teamsTokenWorker;

// Função para renovar token de um usuário específico
async function refreshSingleUser(userId) {
  try {
    const teamsService = new (0, _TeamsAuthServicejs2.default)();
    const isAuthenticated = await teamsService.isUserAuthenticated(userId);

    if (!isAuthenticated) {
      console.log(`[TeamsTokenWorker] Usuário ${userId} não autenticado, removendo jobs agendados`);
      await cancelUserRefreshJobs(userId);
      return { success: false, reason: 'not_authenticated' };
    }

    // Buscar token diretamente do MySQL (sem cache)
    console.log(`[TeamsTokenWorker] Buscando token do usuário ${userId} no MySQL...`);

    const tokenRecord = await _TeamsTokenjs2.default.findOne({
      where: { user_id: userId, is_active: true }
    });

    if (!tokenRecord) {
      console.log(`[TeamsTokenWorker] Token não encontrado no banco para usuário ${userId}`);
      return { success: false, reason: 'token_not_found' };
    }

    // Verificar se precisa renovar (expira em menos de 15 minutos)
    const expiresAt = new Date(tokenRecord.expires_at);
    const fifteenMinutesFromNow = new Date(Date.now() + (15 * 60 * 1000));

    if (expiresAt > fifteenMinutesFromNow) {
      const timeLeft = Math.round((expiresAt - Date.now()) / (1000 * 60));
      console.log(`[TeamsTokenWorker] Token do usuário ${userId} ainda válido por mais ${timeLeft} minutos`);
      return { success: true, reason: 'token_still_valid', timeLeftMinutes: timeLeft };
    }

    // Renovar token
    const newTokens = await teamsService.refreshAccessToken(userId);

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

    // Se refresh token expirou, remove do banco e cancela jobs
    if (error.message.includes('invalid_grant') || error.message.includes('expired')) {
      await teamsService.revokeUserTokens(userId);
      await cancelUserRefreshJobs(userId);
      console.log(`[TeamsTokenWorker] Usuário ${userId} removido - refresh token expirado`);
    }

    throw error;
  }
}

// Função para renovar tokens de todos os usuários
async function refreshAllUsers() {
  try {
    const results = [];

    // Buscar todos os tokens ativos diretamente do MySQL (sem cache)
    console.log('[TeamsTokenWorker] Buscando tokens ativos do MySQL...');

    const activeTokens = await _TeamsTokenjs2.default.findAll({
      where: { is_active: true }
    });

    console.log(`[TeamsTokenWorker] Verificando ${activeTokens.length} usuários para renovação`);

    for (const tokenRecord of activeTokens) {
      try {
        const userId = tokenRecord.user_id;
        const expiresAt = new Date(tokenRecord.expires_at);

        // Verificar se precisa renovar (expira em menos de 10 minutos)
        const tenMinutesFromNow = new Date(Date.now() + (10 * 60 * 1000));

        if (expiresAt <= tenMinutesFromNow) {
          // Agendar renovação individual
          await exports.teamsTokenQueue.add('refresh-single-user', {
            type: 'refresh-single-user',
            userId
          }, {
            priority: 10, // Alta prioridade para tokens expirando
            delay: 0,     // Executar imediatamente
          });

          results.push({ userId, action: 'scheduled_refresh', expiresAt: expiresAt.toISOString() });
        } else {
          const timeLeft = Math.round((expiresAt - Date.now()) / (1000 * 60));
          results.push({ userId, action: 'token_valid', timeLeftMinutes: timeLeft });
        }
      } catch (error) {
        console.error(`[TeamsTokenWorker] Erro ao verificar usuário ${tokenRecord.user_id}:`, error.message);
        results.push({ userId: tokenRecord.user_id, action: 'error', error: error.message });
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
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    console.log('[TeamsTokenWorker] Buscando tokens expirados no MySQL...');

    // Buscar tokens expirados diretamente do MySQL
    const expiredTokens = await _TeamsTokenjs2.default.findAll({
      where: {
        is_active: true,
        expires_at: {
          [_sequelize.Op.lte]: oneDayAgo
        }
      }
    });

    const expiredUsers = expiredTokens.map(token => token.user_id);

    // Remover tokens expirados e cancelar jobs
    for (const userId of expiredUsers) {
      const teamsService = new (0, _TeamsAuthServicejs2.default)();
      await teamsService.revokeUserTokens(userId);
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
 async function scheduleUserTokenRefresh(userId, expiresAt) {
  try {
    // Cancelar jobs existentes para este usuário
    await cancelUserRefreshJobs(userId);

    // Calcular delay (renovar 10 minutos antes do vencimento)
    const refreshTime = new Date(expiresAt.getTime() - (10 * 60 * 1000));
    const delay = Math.max(0, refreshTime.getTime() - Date.now());

    // Agendar novo job
    const job = await exports.teamsTokenQueue.add(
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
} exports.scheduleUserTokenRefresh = scheduleUserTokenRefresh;

// Função para cancelar jobs de renovação de um usuário
 async function cancelUserRefreshJobs(userId) {
  try {
    const jobId = `refresh-${userId}`;

    // Tentar remover job agendado
    const job = await exports.teamsTokenQueue.getJob(jobId);
    if (job) {
      await job.remove();
      console.log(`[TeamsTokenQueue] Job cancelado para usuário ${userId}`);
    }

    return true;
  } catch (error) {
    console.error(`[TeamsTokenQueue] Erro ao cancelar jobs para usuário ${userId}:`, error.message);
    return false;
  }
} exports.cancelUserRefreshJobs = cancelUserRefreshJobs;

// Função para agendar verificação periódica de todos os usuários
 async function schedulePeriodicRefresh() {
  try {
    // Remover job existente se houver
    await exports.teamsTokenQueue.removeRepeatable('refresh-all-users', {
      pattern: '*/30 * * * *', // A cada 30 minutos
    });

    // Agendar nova verificação periódica
    await exports.teamsTokenQueue.add(
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
    await exports.teamsTokenQueue.add(
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
} exports.schedulePeriodicRefresh = schedulePeriodicRefresh;

// Event listeners para monitoramento
exports.teamsTokenWorker.on('completed', (job, result) => {
  console.log(`[TeamsTokenWorker] Job ${job.id} completado:`, result);
});

exports.teamsTokenWorker.on('failed', (job, err) => {
  console.error(`[TeamsTokenWorker] Job ${_optionalChain([job, 'optionalAccess', _ => _.id])} falhou:`, err.message);
});

exports.teamsTokenWorker.on('error', (err) => {
  console.error('[TeamsTokenWorker] Erro no worker:', err.message);
});

// Função para obter estatísticas da queue
 async function getQueueStats() {
  const waiting = await exports.teamsTokenQueue.getWaiting();
  const active = await exports.teamsTokenQueue.getActive();
  const completed = await exports.teamsTokenQueue.getCompleted();
  const failed = await exports.teamsTokenQueue.getFailed();

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
    totalJobs: waiting.length + active.length + completed.length + failed.length
  };
} exports.getQueueStats = getQueueStats;

exports. default = {
  queue: exports.teamsTokenQueue,
  worker: exports.teamsTokenWorker,
  scheduleUserTokenRefresh,
  cancelUserRefreshJobs,
  schedulePeriodicRefresh,
  getQueueStats,
};
