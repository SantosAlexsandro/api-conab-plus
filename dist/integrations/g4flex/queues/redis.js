"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/integrations/g4flex/queues/redis.js
var _ioredis = require('ioredis');

const redisConnection = new (0, _ioredis.Redis)({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
});

exports. default = redisConnection;
