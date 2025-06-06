import TeamsAuthService from '../services/TeamsAuthService.js';
import TeamsService from '../services/TeamsService.js';

// Exemplo prático de uso da integração Teams

class TeamsUsageExample {
  constructor() {
    this.teamsAuth = TeamsAuthService;
    this.teamsService = TeamsService;
  }

  // 1. Primeiro passo: Iniciar autenticação
  async startAuthentication(userId = 'user123') {
    try {
      console.log('🚀 Iniciando autenticação do Teams...');

      // Gera URL de autorização
      const authUrl = this.teamsAuth.generateAuthUrl(userId);

      console.log('📋 URL de autorização gerada:');
      console.log(authUrl);
      console.log('\n💡 Abra esta URL no navegador para autorizar a aplicação');

      return authUrl;
    } catch (error) {
      console.error('❌ Erro ao iniciar autenticação:', error.message);
      throw error;
    }
  }

  // 2. Segundo passo: Processar callback (simular)
  async handleCallback(userId, authCode) {
    try {
      console.log('🔄 Processando callback de autenticação...');

      const tokens = await this.teamsAuth.exchangeCodeForTokens(userId, authCode);

      console.log('✅ Tokens obtidos com sucesso!');
      console.log('📝 Informações do token:');
      console.log(`- Expires at: ${tokens.expiresAt}`);
      console.log(`- Has refresh token: ${!!tokens.refreshToken}`);

      return tokens;
    } catch (error) {
      console.error('❌ Erro no callback:', error.message);
      throw error;
    }
  }

  // 3. Obter informações do usuário
  async getUserInfo(userId) {
    try {
      console.log('👤 Obtendo informações do usuário...');

      const userInfo = await this.teamsAuth.getUserInfo(userId);

      console.log('✅ Informações do usuário:');
      console.log(`- Nome: ${userInfo.displayName}`);
      console.log(`- Email: ${userInfo.userPrincipalName}`);
      console.log(`- ID: ${userInfo.id}`);

      return userInfo;
    } catch (error) {
      console.error('❌ Erro ao obter informações:', error.message);
      throw error;
    }
  }

  // 4. Listar chats do usuário
  async listUserChats(userId) {
    try {
      console.log('💬 Listando chats do usuário...');

      const chats = await this.teamsService.getUserChats(userId);

      console.log(`✅ Encontrados ${chats.length} chats:`);
      chats.slice(0, 5).forEach((chat, index) => {
        console.log(`${index + 1}. ${chat.topic || 'Chat sem título'} (ID: ${chat.id})`);
      });

      return chats;
    } catch (error) {
      console.error('❌ Erro ao listar chats:', error.message);
      throw error;
    }
  }

  // 5. Enviar mensagem para um chat
  async sendMessage(userId, chatId, message) {
    try {
      console.log('📤 Enviando mensagem...');

      const result = await this.teamsService.sendMessage(userId, chatId, message);

      console.log('✅ Mensagem enviada com sucesso!');
      console.log(`📝 ID da mensagem: ${result.id}`);

      return result;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error.message);
      throw error;
    }
  }

  // 6. Buscar usuários na organização
  async searchUsers(userId, searchTerm = 'teste') {
    try {
      console.log(`🔍 Buscando usuários com termo: ${searchTerm}`);

      const users = await this.teamsService.searchUsers(userId, searchTerm);

      console.log(`✅ Encontrados ${users.length} usuários:`);
      users.slice(0, 5).forEach((user, index) => {
        console.log(`${index + 1}. ${user.displayName} (${user.userPrincipalName})`);
      });

      return users;
    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error.message);
      throw error;
    }
  }

  // 7. Exemplo completo de workflow
  async fullWorkflowExample(userId = 'user123') {
    try {
      console.log('🚀 Iniciando workflow completo de exemplo...\n');

      // Passo 1: Verificar se já está autenticado
      const isAuthenticated = this.teamsAuth.isUserAuthenticated(userId);

      if (!isAuthenticated) {
        console.log('⚠️  Usuário não autenticado. É necessário fazer login primeiro.');
        const authUrl = await this.startAuthentication(userId);
        console.log('\n📋 Para continuar, faça login usando a URL acima e depois execute novamente.\n');
        return { step: 'authentication_required', authUrl };
      }

      // Passo 2: Obter informações do usuário
      const userInfo = await this.getUserInfo(userId);

      // Passo 3: Listar chats
      const chats = await this.listUserChats(userId);

      // Passo 4: Buscar usuários
      await this.searchUsers(userId, 'user');

      console.log('\n🎉 Workflow completo executado com sucesso!');

      return {
        step: 'completed',
        userInfo,
        chatsCount: chats.length
      };

    } catch (error) {
      console.error('❌ Erro no workflow completo:', error.message);
      throw error;
    }
  }

  // 8. Exemplo de uso em controlador de Work Order
  async sendWorkOrderNotification(userId, workOrderData) {
    try {
      console.log('📋 Enviando notificação de Work Order...');

      // Criar mensagem formatada
      const message = `
🔧 **Nova Ordem de Serviço Criada**

**ID:** ${workOrderData.id}
**Cliente:** ${workOrderData.cliente}
**Prioridade:** ${workOrderData.prioridade}
**Data:** ${new Date().toLocaleDateString('pt-BR')}

**Descrição:** ${workOrderData.descricao}

*Notificação automática do sistema CONAB+*
      `;

      // Buscar chat ou usuário específico para enviar
      const chats = await this.teamsService.getUserChats(userId);

      if (chats.length > 0) {
        // Enviar para o primeiro chat disponível
        const result = await this.sendMessage(userId, chats[0].id, message);
        console.log('✅ Notificação de Work Order enviada!');
        return result;
      } else {
        console.log('⚠️  Nenhum chat disponível para enviar notificação');
        return null;
      }

    } catch (error) {
      console.error('❌ Erro ao enviar notificação de Work Order:', error.message);
      throw error;
    }
  }
}

export default TeamsUsageExample;

// Exemplo de uso direto (para testes)
// const example = new TeamsUsageExample();
// example.fullWorkflowExample('meu_usuario_id');
