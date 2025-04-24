"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/integrations/g4flex/queues/redis.js
var _ioredis = require('ioredis');
var _dotenv = require('dotenv'); var _dotenv2 = _interopRequireDefault(_dotenv);

_dotenv2.default.config();

const redisConnection = new (0, _ioredis.Redis)({
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

exports. default = redisConnection;
