import TeamsUsageExample from './src/integrations/teams/examples/teamsUsageExample.js';

// Script de teste para a integração Teams
async function testTeamsIntegration() {
  console.log('🧪 Testando integração do Microsoft Teams...\n');

  try {
    const example = new TeamsUsageExample();

    // Use seu ID de usuário real (pode ser qualquer string única)
    const userId = 'usuario_real_teste';

    // Executar workflow de exemplo
    const result = await example.fullWorkflowExample(userId);

    console.log('\n📊 Resultado do teste:', result);

  } catch (error) {
    console.error('\n❌ Erro no teste:', error.message);

    // Mostrar informações sobre variáveis de ambiente
    console.log('\n🔧 Verificação de configuração:');
    console.log('- TEAMS_CLIENT_ID:', process.env.TEAMS_CLIENT_ID ? '✅ Configurado' : '❌ Não configurado');
    console.log('- TEAMS_CLIENT_SECRET:', process.env.TEAMS_CLIENT_SECRET ? '✅ Configurado' : '❌ Não configurado');
    console.log('- TEAMS_TENANT_ID:', process.env.TEAMS_TENANT_ID ? '✅ Configurado' : '❌ Não configurado');
    console.log('- TEAMS_REDIRECT_URI:', process.env.TEAMS_REDIRECT_URI ? '✅ Configurado' : '❌ Não configurado');
  }
}

// Executar teste
testTeamsIntegration();
