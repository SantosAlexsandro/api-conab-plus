import TeamsAuthService from '../services/TeamsAuthService.js';
import teamsWorkOrderNotificationService from '../services/TeamsWorkOrderNotificationService.js';

// Script para configurar notificações de Work Orders no Teams

class WorkOrderNotificationSetup {
  constructor() {
    this.teamsAuth = TeamsAuthService;
    this.notificationService = teamsWorkOrderNotificationService;
  }

  // Configurar usuário de notificação
  async setupNotificationUser(userId = 'work_order_bot') {
    try {
      console.log('🔧 Configurando usuário de notificação para Work Orders...');

      const isAuthenticated = this.teamsAuth.isUserAuthenticated(userId);

      if (!isAuthenticated) {
        console.log('⚠️ Usuário não autenticado. Gerando URL...');
        const authUrl = this.teamsAuth.generateAuthUrl(userId);
        console.log('📋 URL de autorização:');
        console.log(authUrl);

        return {
          step: 'authentication_required',
          authUrl,
          userId
        };
      }

      this.notificationService.setDefaultNotificationUser(userId);
      const status = this.notificationService.getConfigurationStatus();

      console.log('✅ Configuração concluída!');
      console.log(`Chat ID: ${status.targetChatId}`);
      console.log(`Usuário: ${status.notificationUser}`);
      console.log(`Configurado: ${status.configured}`);

      return { step: 'completed', status };

    } catch (error) {
      console.error('❌ Erro na configuração:', error.message);
      throw error;
    }
  }

  // Completar autenticação
  async completeAuth(userId, authCode) {
    try {
      console.log('🔄 Completando autenticação...');
      const tokens = await this.teamsAuth.exchangeCodeForTokens(authCode, userId);
      console.log('✅ Autenticação concluída!');

      this.notificationService.setDefaultNotificationUser(userId);
      await this.testNotification();

      return tokens;
    } catch (error) {
      console.error('❌ Erro na autenticação:', error.message);
      throw error;
    }
  }

  // Testar notificação
  async testNotification() {
    try {
      console.log('🧪 Testando notificação...');

      const testData = {
        workOrder: 'OS-TEST-001',
        customerName: 'Cliente Teste',
        priority: 'alta',
        requesterContact: 'teste@conab.com',
        incidentAndReceiverName: 'Teste de integração Teams',
        uraRequestId: 'test-' + Date.now()
      };

      const result = await this.notificationService.sendWorkOrderCreatedNotification(testData);

      if (result.success) {
        console.log('✅ Teste enviado com sucesso!');
      } else {
        console.error('❌ Falha no teste:', result.reason);
      }

      return result;
    } catch (error) {
      console.error('❌ Erro no teste:', error.message);
      throw error;
    }
  }

  // Verificar status atual
  async checkStatus() {
    try {
      console.log('📊 Verificando status das notificações...\n');

      const status = this.notificationService.getConfigurationStatus();

      console.log('🔧 Configuração atual:');
      console.log(`  - Chat de destino: ${status.targetChatId}`);
      console.log(`  - Usuário de notificação: ${status.notificationUser}`);
      console.log(`  - Status de autenticação: ${status.isAuthenticated ? '✅ Autenticado' : '❌ Não autenticado'}`);
      console.log(`  - Sistema configurado: ${status.configured ? '✅ Sim' : '❌ Não'}\n`);

      if (status.configured) {
        console.log('🎉 Sistema pronto para enviar notificações automáticas!');
        console.log('📋 As notificações serão enviadas automaticamente quando:');
        console.log('  - Uma nova Work Order for criada');
        console.log('  - Um técnico for atribuído');
      } else {
        console.log('⚠️ Sistema não está totalmente configurado.');
        console.log('💡 Execute: setup.setupNotificationUser() para configurar');
      }

      return status;

    } catch (error) {
      console.error('❌ Erro ao verificar status:', error.message);
      throw error;
    }
  }

  // Testar notificação de técnico atribuído
  async testTechnicianNotification() {
    try {
      console.log('\n🧪 Testando notificação de técnico atribuído...');

      const testWorkOrderData = {
        orderId: 'OS-TEST-002',
        customerName: 'Cliente Teste Técnico',
        requesterContact: 'teste.tecnico@conab.com',
        uraRequestId: 'test-tech-' + Date.now()
      };

      const testTechnicianData = {
        id: 'TECH001',
        name: 'João Silva (Teste)'
      };

      const result = await this.notificationService.sendTechnicianAssignedNotification(
        testWorkOrderData,
        testTechnicianData
      );

      if (result.success) {
        console.log('✅ Teste de notificação de técnico enviado com sucesso!');
        console.log(`📱 Mensagem ID: ${result.messageId}`);
      } else {
        console.error('❌ Falha no teste de técnico:', result.reason);
      }

      return result;

    } catch (error) {
      console.error('❌ Erro no teste de técnico:', error.message);
      throw error;
    }
  }
}

export default new WorkOrderNotificationSetup();

// Exemplo de uso:
// const setup = new WorkOrderNotificationSetup();
// await setup.setupNotificationUser('work_order_bot');
// await setup.completeAuth('work_order_bot', 'codigo_do_callback');
// await setup.testNotification();
