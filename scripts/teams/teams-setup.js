import dotenv from 'dotenv';

// IMPORTANTE: Carregar .env ANTES de qualquer import que use variáveis de ambiente
dotenv.config();

import TeamsAuthService from '../src/integrations/teams/services/TeamsAuthService.js';

console.log('🔧 Configuração Teams - Gerar URL de Autorização\n');

try {
  const teamsService = new TeamsAuthService();
  const url = teamsService.generateAuthUrl('work_order_bot');

  console.log('🔗 URL DE AUTORIZAÇÃO:');
  console.log(url);
  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('1. Abra a URL acima no navegador');
  console.log('2. Faça login com conta que tem acesso ao grupo Teams');
  console.log('3. Autorize a aplicação');
  console.log('4. Copie o CÓDIGO da URL de callback');
  console.log('5. Execute: npm run teams:complete CODIGO_AQUI');
  console.log('\n💡 O código estará na URL após autorização, exemplo:');
  console.log('http://localhost:3000/auth/teams/callback?code=SEU_CODIGO_AQUI&state=work_order_bot');

} catch (error) {
  console.error('❌ Erro:', error.message);
  console.log('\n💡 Certifique-se de que as variáveis do Teams estão configuradas no .env:');
  console.log('TEAMS_CLIENT_ID, TEAMS_CLIENT_SECRET, TEAMS_TENANT_ID, TEAMS_REDIRECT_URI');
}
