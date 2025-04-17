// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'api.conab',
      script: 'dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M'
    },
    {
      name: 'worker.order',
      script: 'dist/integrations/g4flex/queues/workOrder.worker.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M'
    },
    {
      name: 'bull.dashboard',
      script: 'dist/integrations/g4flex/queues/bull-dashboard.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '150M'
    }
  ]
};
