// src/integrations/g4flex/queues/bull-dashboard.js
import express from 'express';
import cors from 'cors';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import workOrderQueue from './workOrder.queue';
import { teamsTokenQueue } from '../../teams/queues/teamsTokenRefreshQueue.js';

const app = express();

// Habilitar CORS para todos os domínios
app.use(cors());

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullMQAdapter(workOrderQueue),
    new BullMQAdapter(teamsTokenQueue)
  ],
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

const PORT = process.env.BULL_DASHBOARD_PORT || 3006;
const HOST = '0.0.0.0'; // Permite acesso de qualquer IP

app.listen(PORT, HOST, () => {
  console.log(`🚀 Painel Bull Board rodando em: http://0.0.0.0:${PORT}/admin/queues`);
  console.log(`🌐 Acesse externamente usando: http://${HOST}:${PORT}/admin/queues`);
});
