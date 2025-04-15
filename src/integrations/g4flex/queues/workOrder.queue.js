// src/integrations/g4flex/queues/workOrder.queue.js
import { Queue } from 'bullmq';
import redisConnection from './redis';

const workOrderQueue = new Queue("workOrderQueue", {
  connection: redisConnection,
});

export default workOrderQueue;

/*
Este script não adiciona nada na fila nem no Redis. Ele apenas configura e cria uma fila chamada 'workOrderQueue' usando o BullMQ.
O que o script faz é:
Cria uma instância da classe Queue do BullMQ
Conecta essa fila ao Redis (usando a conexão que foi importada)
Exporta a fila para ser usada em outros arquivos
Para adicionar itens à fila, você precisaria usar o método workOrderQueue.add() em outras partes do código onde este módulo é importado.
A fila BullMQ usa o Redis como banco de dados para armazenar seus dados (jobs, estados, etc.), mas este arquivo apenas define a estrutura, não adiciona conteúdo.
*/
