import dotenv from 'dotenv';
dotenv.config();

import '../../src/database/index.js';
import TeamsAuthService from '../../src/integrations/teams/services/TeamsAuthService.js';
import teamsWorkOrderNotificationService from '../../src/integrations/teams/services/TeamsWorkOrderNotificationService.js';

async function forceTokenRefreshAndTest() {
  try {
    console.log('🔄 FORÇANDO RENOVAÇÃO DO ACCESS TOKEN\n');

    const userId = 'work_order_bot';
    const teamsAuth = new TeamsAuthService();

    // 1. Verificar status atual
    console.log('1️⃣ Status atual do token...');
    const isAuthenticated = await teamsAuth.isUserAuthenticated(userId);
    console.log(`   Autenticado: ${isAuthenticated ? '✅' : '❌'}\n`);

    if (!isAuthenticated) {
      console.log('❌ Usuário não autenticado. Execute primeiro insert-new-teams-token.js');
      return;
    }

    // 2. Forçar renovação do access token
    console.log('2️⃣ FORÇANDO renovação do access token...');
    try {
      const newTokens = await teamsAuth.refreshAccessToken(userId);
      console.log('   ✅ Access token renovado com sucesso!');
      console.log(`   🕐 Novo token expira em: ${newTokens.expiresAt}`);
      console.log(`   📏 Tamanho do novo token: ${newTokens.accessToken.length} caracteres\n`);
    } catch (refreshError) {
      console.log('   ❌ ERRO na renovação:', refreshError.message);
      console.log('   🔧 Tentativa alternativa: buscar token direto do banco...\n');
    }

    // 3. Validar novo token com API
    console.log('3️⃣ Validando novo token com API Teams...');
    try {
      const userInfo = await teamsAuth.getUserInfo(userId);
      console.log('   ✅ Token válido! Dados do usuário:');
      console.log(`   👤 Nome: ${userInfo.displayName}`);
      console.log(`   📧 Email: ${userInfo.userPrincipalName}\n`);
    } catch (validationError) {
      console.log('   ❌ Token ainda inválido:', validationError.message);
      console.log('   ⚠️ Pode ser necessário reautenticar manualmente\n');
    }

    // 4. Teste de notificação com novo token
    console.log('4️⃣ Testando notificação com token renovado...');

    const testData = {
      workOrder: 'OS-REFRESH-' + Date.now(),
      customerName: 'Cliente Teste Token Renovado',
      priority: 'alta',
      requesterContact: 'token.refresh@conab.com.br',
      incidentAndReceiverName: '🔄 Teste após renovação forçada do access token',
      uraRequestId: 'refresh-test-' + Date.now()
    };

    const result = await teamsWorkOrderNotificationService.sendWorkOrderCreatedNotification(testData);

    if (result.success) {
      console.log('   🎉 SUCESSO! Notificação enviada após renovação!');
      console.log(`   📱 Message ID: ${result.messageId}`);
      console.log(`   💬 Chat ID: ${result.chatId}`);
    } else {
      console.log('   ❌ Ainda com erro após renovação');
      console.log(`   🔍 Motivo: ${result.reason || result.error}`);

      // Diagnóstico adicional
      console.log('\n🔧 DIAGNÓSTICO ADICIONAL:');
      console.log('════════════════════════════════════');

      // Verificar se refresh token ainda é válido
      console.log('Verificando refresh token...');
      const TeamsToken = (await import('../../src/models/TeamsToken.js')).default;
      const tokenRecord = await TeamsToken.findOne({
        where: { user_id: userId, is_active: true }
      });

      if (tokenRecord) {
        console.log(`📋 Refresh token size: ${tokenRecord.refresh_token.length} chars`);
        console.log(`🕐 Token expiration: ${tokenRecord.expires_at}`);
        console.log(`✅ Token status: ${tokenRecord.is_active ? 'Ativo' : 'Inativo'}`);

        // Sugestões de correção
        console.log('\n💡 SUGESTÕES:');
        console.log('1. Reautenticar completamente via Postman');
        console.log('2. Verificar se app Teams não foi revogado');
        console.log('3. Verificar configurações do tenant Azure');
      }
    }

  } catch (error) {
    console.error('\n❌ ERRO GERAL:', error.message);
    console.log('\n🔧 SOLUÇÕES POSSÍVEIS:');
    console.log('1. Reobter tokens via Postman');
    console.log('2. Verificar configurações Teams_CLIENT_ID/SECRET');
    console.log('3. Verificar permissões da aplicação Azure');
  } finally {
    process.exit(0);
  }
}

forceTokenRefreshAndTest();
