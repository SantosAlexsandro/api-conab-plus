import setup from '../../src/integrations/teams/examples/setupWorkOrderNotifications.js';

console.log('📊 Verificando status da configuração Teams...\n');

async function checkStatus() {
  try {
    const status = await setup.checkStatus();

    if (status.configured) {
      console.log('🎉 Sistema pronto para enviar notificações automáticas!');
      console.log('\n📋 As notificações serão enviadas automaticamente quando:');
      console.log('  ✅ Uma nova Work Order for criada');
      console.log('  ✅ Um técnico for atribuído');
      console.log(`\n📱 Chat de destino: ${status.targetChatId}`);
    } else {
      console.log('⚠️ Sistema não está totalmente configurado.');
      console.log('\n💡 Para configurar, execute:');
      console.log('  1. npm run teams:setup');
      console.log('  2. npm run teams:complete CODIGO_AQUI');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar status:', error.message);
    console.log('\n💡 Execute npm run teams:setup para iniciar configuração');
  }
}

checkStatus();
