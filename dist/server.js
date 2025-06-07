"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _app = require('./app'); var _app2 = _interopRequireDefault(_app);
var _teamsInitializerjs = require('./integrations/teams/utils/teamsInitializer.js'); var _teamsInitializerjs2 = _interopRequireDefault(_teamsInitializerjs);

const port = process.env.APP_PORT;

// Inicializa o sistema Teams com BullMQ
_teamsInitializerjs2.default.initialize().then((success) => {
  if (success) {
    console.log('🔄 Sistema Teams com BullMQ inicializado');
  } else {
    console.log('⚠️ Sistema Teams não foi totalmente inicializado');
  }
}).catch((error) => {
  console.error('❌ Erro ao inicializar sistema Teams:', error.message);
});

_app2.default.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});

