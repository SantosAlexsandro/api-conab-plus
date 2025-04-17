"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/integrations/g4flex/queues/redis.js
var _ioredis = require('ioredis');

const redisConnection = new (0, _ioredis.Redis)({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
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

exports. default = redisConnection;
