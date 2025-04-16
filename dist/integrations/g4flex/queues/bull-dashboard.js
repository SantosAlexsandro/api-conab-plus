"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/integrations/g4flex/queues/bull-dashboard.js
var _express = require('express'); var _express2 = _interopRequireDefault(_express);
var _express3 = require('@bull-board/express');
var _api = require('@bull-board/api');
var _bullMQAdapter = require('@bull-board/api/bullMQAdapter');
var _workOrderqueue = require('./workOrder.queue'); var _workOrderqueue2 = _interopRequireDefault(_workOrderqueue);

const app = _express2.default.call(void 0, );
const serverAdapter = new (0, _express3.ExpressAdapter)();
serverAdapter.setBasePath('/admin/queues');

_api.createBullBoard.call(void 0, {
  queues: [new (0, _bullMQAdapter.BullMQAdapter)(_workOrderqueue2.default)],
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

const PORT = 3006;
app.listen(PORT, () => {
  console.log(`🚀 Painel Bull Board rodando em: http://localhost:${PORT}/admin/queues`);
});
