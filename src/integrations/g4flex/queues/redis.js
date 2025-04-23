// src/integrations/g4flex/queues/redis.js
import { Redis } from 'ioredis';

const redisConnection = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => {
    // Estratégia exponencial de reconexão
    return Math.min(times * 100, 3000);
  },
  reconnectOnError: (err) => {
    // Reconectar apenas para erros específicos
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  }
});

// Logs para monitorar a conexão
redisConnection.on('connect', () => {
  console.log('📊 Redis: Conectado ao servidor');
});

redisConnection.on('error', (err) => {
  console.error('❌ Redis: Erro na conexão', err);
});

redisConnection.on('reconnecting', () => {
  console.log('🔄 Redis: Tentando reconectar...');
});

export default redisConnection;
