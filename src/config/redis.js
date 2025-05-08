const Redis = require('ioredis');
const { promisify } = require('util');
require('dotenv').config();

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'conab-plus:'
});

redisClient.on('error', (error) => {
  console.error('Erro na conexão com Redis:', error);
});

module.exports = redisClient;