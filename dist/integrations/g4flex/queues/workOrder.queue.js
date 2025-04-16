"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/integrations/g4flex/queues/workOrder.queue.js
var _bullmq = require('bullmq');
var _redis = require('./redis'); var _redis2 = _interopRequireDefault(_redis);

const workOrderQueue = new (0, _bullmq.Queue)("workOrderQueue", {
  connection: _redis2.default,
});

exports. default = workOrderQueue;

/*
Este script não adiciona nada na fila nem no Redis. Ele apenas configura e cria uma fila chamada 'workOrderQueue' usando o BullMQ.
O que o script faz é:
Cria uma instância da classe Queue do BullMQ
Conecta essa fila ao Redis (usando a conexão que foi importada)
Exporta a fila para ser usada em outros arquivos
Para adicionar itens à fila, você precisaria usar o método workOrderQueue.add() em outras partes do código onde este módulo é importado.
A fila BullMQ usa o Redis como banco de dados para armazenar seus dados (jobs, estados, etc.), mas este arquivo apenas define a estrutura, não adiciona conteúdo.
*/
