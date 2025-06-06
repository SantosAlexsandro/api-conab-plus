import { schedulePeriodicRefresh } from '../queues/teamsTokenRefreshQueue.js';

// Inicializador do sistema Teams
// Configura jobs periódicos e inicialização automática

class TeamsInitializer {
  constructor() {
    this.initialized = false;
  }

  // Inicializa o sistema Teams
  async initialize() {
    try {
      if (this.initialized) {
        console.log('[TeamsInitializer] Sistema Teams já foi inicializado');
        return;
      }

      console.log('[TeamsInitializer] 🚀 Inicializando sistema Teams...');

      // Verificar configuração
      const configCheck = this.checkConfiguration();
      if (!configCheck.valid) {
        console.warn('[TeamsInitializer] ⚠️ Configuração incompleta do Teams:', configCheck.error);
        console.warn('[TeamsInitializer] ⚠️ Sistema Teams não será totalmente funcional');
        return false;
      }

      // Configurar jobs periódicos
      await this.setupPeriodicJobs();

      this.initialized = true;
      console.log('[TeamsInitializer] ✅ Sistema Teams inicializado com sucesso');

      return true;

    } catch (error) {
      console.error('[TeamsInitializer] ❌ Erro ao inicializar sistema Teams:', error.message);
      return false;
    }
  }

  // Verifica se as variáveis de ambiente necessárias estão configuradas
  checkConfiguration() {
    const requiredVars = [
      'TEAMS_CLIENT_ID',
      'TEAMS_CLIENT_SECRET',
      'TEAMS_TENANT_ID',
      'TEAMS_REDIRECT_URI'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      return {
        valid: false,
        error: `Variáveis não configuradas: ${missingVars.join(', ')}`
      };
    }

    return { valid: true };
  }

  // Configura jobs periódicos
  async setupPeriodicJobs() {
    try {
      console.log('[TeamsInitializer] 📅 Configurando jobs periódicos...');

      // Agendar verificação periódica de tokens (a cada 30 minutos)
      await schedulePeriodicRefresh();

      console.log('[TeamsInitializer] ✅ Jobs periódicos configurados:');
      console.log('  - Verificação de tokens: a cada 30 minutos');
      console.log('  - Limpeza de tokens expirados: diariamente às 2:00 AM');

    } catch (error) {
      console.error('[TeamsInitializer] ❌ Erro ao configurar jobs periódicos:', error.message);
      throw error;
    }
  }

  // Obtém status do sistema
  getStatus() {
    const configCheck = this.checkConfiguration();

    return {
      initialized: this.initialized,
      configuration: configCheck,
      timestamp: new Date().toISOString()
    };
  }
}

const teamsInitializer = new TeamsInitializer();
export default teamsInitializer;
