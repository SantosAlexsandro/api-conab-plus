import setup from '../src/integrations/teams/examples/setupWorkOrderNotifications';

console.log('🧪 Testando notificação Teams...\n');

async function test() {
  try {
    const result = await setup.testNotification();

    if (result.success) {
      console.log('✅ Teste enviado com sucesso!');
      console.log(`📱 Mensagem ID: ${result.messageId}`);
      console.log(`📋 Chat ID: ${result.chatId}`);
      console.log('\n🎉 Sistema funcionando corretamente!');
    } else {
      console.error('❌ Falha no teste:', result.reason);
      console.log('\n💡 Dicas:');
      console.log('- Execute npm run teams:setup se não estiver configurado');
      console.log('- Verifique se o usuário tem acesso ao grupo Teams');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.log('\n💡 Sistema pode não estar configurado corretamente.');
    console.log('Execute: npm run teams:setup');
  }
}

test();
