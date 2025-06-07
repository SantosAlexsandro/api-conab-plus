import setup from '../../src/integrations/teams/examples/setupWorkOrderNotifications.js';

const authCode = process.argv[2];

if (!authCode) {
  console.error('❌ Erro: Código de autorização não fornecido');
  console.log('💡 Uso: npm run teams:complete CODIGO_AQUI');
  console.log('💡 Exemplo: npm run teams:complete M.R3_BAY.-CeKf7Hj8...');
  process.exit(1);
}

console.log('🔄 Completando autenticação Teams...');

async function complete() {
  try {
    const tokens = await setup.completeAuth('work_order_bot', authCode);
    console.log('✅ Autenticação concluída com sucesso!');
    console.log(`📅 Token expira em: ${tokens.expiresAt.toLocaleString('pt-BR')}`);

    console.log('\n🧪 Enviando teste de notificação...');
    await setup.testNotification();

    console.log('\n📊 Verificando status final...');
    await setup.checkStatus();

    console.log('\n🎉 Configuração completa! O sistema já está enviando notificações automáticas.');
    console.log('📱 Chat de destino: 19:b2f438dde3f74c5daf960d92dbecf443@thread.v2');

  } catch (error) {
    console.error('❌ Erro na autenticação:', error.message);
    console.log('\n💡 Dicas:');
    console.log('- Verifique se o código foi copiado corretamente');
    console.log('- Certifique-se de que as variáveis .env estão configuradas');
    console.log('- Execute npm run teams:setup novamente se necessário');
    process.exit(1);
  }
}

complete();
