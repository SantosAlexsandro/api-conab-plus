// src/integrations/g4flex/queues/bull-dashboard.js
import express from 'express';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import workOrderQueue from './workOrder.queue';

const app = express();
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(workOrderQueue)],
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

const PORT = 3006;
app.listen(PORT, () => {
  console.log(`🚀 Painel Bull Board rodando em: http://localhost:${PORT}/admin/queues`);
});
