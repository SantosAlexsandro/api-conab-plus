import app from './app';
import teamsInitializer from './integrations/teams/utils/teamsInitializer.js';

const port = process.env.APP_PORT;

// Inicializa o sistema Teams com BullMQ
teamsInitializer.initialize().then((success) => {
  if (success) {
    console.log('🔄 Sistema Teams com BullMQ inicializado');
  } else {
    console.log('⚠️ Sistema Teams não foi totalmente inicializado');
  }
}).catch((error) => {
  console.error('❌ Erro ao inicializar sistema Teams:', error.message);
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});

