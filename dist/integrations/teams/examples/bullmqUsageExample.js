"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _TeamsAuthServicejs = require('../services/TeamsAuthService.js'); var _TeamsAuthServicejs2 = _interopRequireDefault(_TeamsAuthServicejs);
var _TeamsServicejs = require('../services/TeamsService.js'); var _TeamsServicejs2 = _interopRequireDefault(_TeamsServicejs);
var _teamsTokenRefreshQueuejs = require('../queues/teamsTokenRefreshQueue.js');

// Exemplo de uso do sistema Teams com BullMQ
// Demonstra como a renovação automática funciona de forma robusta

class TeamsBullMQUsageExample {
  constructor() {
    this.teamsAuth = _TeamsAuthServicejs2.default;
    this.teamsService = _TeamsServicejs2.default;
  }

  // Exemplo completo: autenticação + uso automático
  async fullWorkflowWithBullMQ(userId = 'user_bullmq_example') {
    try {
      console.log('🚀 Iniciando workflow completo com BullMQ...\n');

      // Passo 1: Verificar se já está autenticado
      const isAuthenticated = this.teamsAuth.isUserAuthenticated(userId);

      if (!isAuthenticated) {
        console.log('⚠️ Usuário não autenticado. Iniciando processo de autenticação...');

        // Gerar URL de autorização
        const authUrl = this.teamsAuth.generateAuthUrl(userId);
        console.log('📋 URL de autorização:', authUrl);
        console.log('\n💡 Abra esta URL no navegador, autorize a aplicação e copie o código da URL de callback');
        console.log('💡 Depois execute: example.handleAuthCallback(userId, authCode)');

        return {
          step: 'authentication_required',
          authUrl,
          instructions: 'Complete a autenticação no navegador'
        };
      }

      // Passo 2: Demonstrar funcionamento automático
      console.log('✅ Usuário autenticado! Demonstrando funcionalidades...\n');

      // Obter informações do usuário
      const userInfo = await this.teamsAuth.getUserInfo(userId);
      console.log(`👤 Usuário: ${userInfo.displayName} (${userInfo.userPrincipalName})`);

      // Listar chats
      const chats = await this.teamsService.getUserChats(userId);
      console.log(`💬 Chats encontrados: ${chats.length}`);

      // Mostrar status dos tokens
      await this.showTokenStatus(userId);

      // Demonstrar que a renovação é automática
      console.log('\n🔄 Sistema BullMQ gerencia renovação automática de tokens:');
      console.log('  ✅ Tokens são renovados automaticamente 10 minutos antes do vencimento');
      console.log('  ✅ Jobs são persistidos no Redis - sobrevivem a restarts');
      console.log('  ✅ Sistema robusto com retry e monitoramento');
      console.log('  ✅ Dashboard disponível para monitoramento');

      return {
        step: 'completed',
        userInfo: {
          name: userInfo.displayName,
          email: userInfo.userPrincipalName
        },
        chatsCount: chats.length,
        systemStatus: 'automated_renewal_active'
      };

    } catch (error) {
      console.error('❌ Erro no workflow:', error.message);
      throw error;
    }
  }

  // Processa callback de autenticação
  async handleAuthCallback(userId, authCode) {
    try {
      console.log('🔄 Processando callback de autenticação...');

      // Trocar código por tokens
      const tokens = await this.teamsAuth.exchangeCodeForTokens(authCode, userId);

      console.log('✅ Tokens obtidos com sucesso!');
      console.log(`📅 Token expira em: ${tokens.expiresAt.toLocaleString('pt-BR')}`);

      // O BullMQ automaticamente agendou a renovação quando os tokens foram obtidos
      console.log('🔄 Renovação automática agendada pelo BullMQ');

      return tokens;

    } catch (error) {
      console.error('❌ Erro no callback:', error.message);
      throw error;
    }
  }

  // Demonstra o envio de mensagem com renovação automática
  async sendMessageWithAutoRenewal(userId, message = '🤖 Mensagem de teste do sistema CONAB+ com renovação automática!') {
    try {
      console.log('📤 Enviando mensagem com sistema de renovação automática...');

      // Listar chats para encontrar um destino
      const chats = await this.teamsService.getUserChats(userId);

      if (chats.length === 0) {
        console.log('⚠️ Nenhum chat disponível para envio');
        return null;
      }

      // Enviar para o primeiro chat
      const targetChat = chats[0];
      console.log(`📧 Enviando para chat: ${targetChat.topic || 'Chat sem título'}`);

      const result = await this.teamsService.sendMessage(userId, targetChat.id, message);

      console.log('✅ Mensagem enviada com sucesso!');
      console.log('💡 Se o token estivesse próximo do vencimento, seria renovado automaticamente');

      return result;

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error.message);
      throw error;
    }
  }

  // Mostra status dos tokens e sistema
  async showTokenStatus(userId) {
    try {
      const tokenCache = this.teamsAuth.tokenCache;
      const userTokens = tokenCache.get(userId);

      if (!userTokens) {
        console.log('❌ Tokens não encontrados para o usuário');
        return;
      }

      const now = new Date();
      const timeUntilExpiry = Math.round((userTokens.expiresAt - now) / (1000 * 60));

      console.log('\n📊 Status dos Tokens:');
      console.log(`  📅 Expira em: ${userTokens.expiresAt.toLocaleString('pt-BR')}`);
      console.log(`  ⏰ Tempo restante: ${timeUntilExpiry} minutos`);

      if (timeUntilExpiry <= 15) {
        console.log('  🔄 Renovação será executada em breve');
      } else {
        console.log('  ✅ Token válido');
      }

      // Mostrar estatísticas da queue
      const queueStats = await _teamsTokenRefreshQueuejs.getQueueStats.call(void 0, );
      console.log('\n📈 Estatísticas da Queue:');
      console.log(`  📋 Jobs aguardando: ${queueStats.waiting}`);
      console.log(`  ⚡ Jobs ativos: ${queueStats.active}`);
      console.log(`  ✅ Jobs completados: ${queueStats.completed}`);
      console.log(`  ❌ Jobs falhados: ${queueStats.failed}`);

    } catch (error) {
      console.error('❌ Erro ao obter status:', error.message);
    }
  }

  // Simula um cenário de alta carga
  async simulateHighLoadScenario(userId) {
    try {
      console.log('🔥 Simulando cenário de alta carga...');

      const operations = [];

      // Simular múltiplas operações simultâneas
      for (let i = 0; i < 5; i++) {
        operations.push(
          this.teamsService.getUserChats(userId).catch(err => ({error: err.message}))
        );
      }

      const results = await Promise.allSettled(operations);
      const successful = results.filter(r => r.status === 'fulfilled' && !r.value.error).length;
      const failed = results.length - successful;

      console.log(`📊 Resultado da simulação: ${successful} sucessos, ${failed} falhas`);
      console.log('💡 BullMQ gerencia renovação de token automaticamente mesmo sob alta carga');

      return { successful, failed, total: results.length };

    } catch (error) {
      console.error('❌ Erro na simulação:', error.message);
      throw error;
    }
  }

  // Exemplo de notificação de Work Order usando sistema robusto
  async sendWorkOrderNotificationRobust(userId, workOrderData) {
    try {
      console.log('📋 Enviando notificação robusta de Work Order...');

      const message = `
🔧 **Nova Ordem de Serviço - Sistema Automatizado**

**Número:** ${workOrderData.id}
**Cliente:** ${workOrderData.cliente}
**Prioridade:** ${workOrderData.prioridade}
**Status:** ${workOrderData.status || 'Em andamento'}

**Descrição:** ${workOrderData.descricao}

**Técnico:** ${workOrderData.tecnico || 'A ser designado'}
**Prazo:** ${workOrderData.prazo || 'Conforme SLA'}

---
*✅ Notificação automática do CONAB+ com renovação de token BullMQ*
*🔄 Sistema resiliente e monitorado*
      `;

      // Buscar chats e enviar
      const chats = await this.teamsService.getUserChats(userId);

      if (chats.length > 0) {
        const result = await this.teamsService.sendMessage(userId, chats[0].id, message);
        console.log('✅ Notificação de Work Order enviada com sucesso!');
        console.log('💪 Sistema BullMQ garante entrega mesmo com tokens expirando');
        return result;
      } else {
        console.log('⚠️ Nenhum chat disponível para notificação');
        return null;
      }

    } catch (error) {
      console.error('❌ Erro ao enviar notificação robusta:', error.message);
      throw error;
    }
  }
}

exports. default = TeamsBullMQUsageExample;

// Exemplo de uso:
// const example = new TeamsBullMQUsageExample();
// await example.fullWorkflowWithBullMQ('meu_usuario');
