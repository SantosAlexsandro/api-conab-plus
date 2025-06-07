import dotenv from 'dotenv';

// IMPORTANTE: Carregar .env ANTES de qualquer import que use variáveis de ambiente
dotenv.config();

import './src/database/index.js';
import TeamsAuthService from './src/integrations/teams/services/TeamsAuthService.js';
import TeamsToken from './src/models/TeamsToken.js';

console.log('🔄 VERIFICANDO SISTEMA DE RENOVAÇÃO AUTOMÁTICA\n');

async function checkRefreshSystem() {
  try {
    // 1. Verificar token no banco
    console.log('📊 1. VERIFICANDO TOKEN NO BANCO:');
    const token = await TeamsToken.findOne({
      where: { user_id: 'work_order_bot', is_active: true }
    });

    if (!token) {
      console.log('❌ Token não encontrado no banco');
      return;
    }

    console.log('✅ Token encontrado:');
    console.log(`   - Access Token: ${token.access_token ? 'Presente' : 'Ausente'}`);
    console.log(`   - Refresh Token: ${token.refresh_token ? 'Presente' : 'Ausente'}`);
    console.log(`   - Expira em: ${token.expires_at}`);

    const now = new Date();
    const timeLeft = Math.floor((token.expires_at - now) / 1000 / 60);
    console.log(`   - Tempo restante: ${timeLeft} minutos`);

    // 2. Testar método de renovação
    console.log('\n🧪 2. TESTANDO MÉTODO DE RENOVAÇÃO:');

    if (!token.refresh_token) {
      console.log('❌ Sem refresh_token - renovação não é possível');
      return;
    }

    console.log('✅ Refresh token presente - testando renovação...');

    const authService = new TeamsAuthService();

    try {
      const newTokens = await authService.refreshAccessToken('work_order_bot');
      console.log('✅ RENOVAÇÃO FUNCIONOU!');
      console.log(`   - Novo Access Token: ${newTokens.accessToken ? 'Obtido' : 'Falhou'}`);
      console.log(`   - Novo Refresh Token: ${newTokens.refreshToken ? 'Obtido' : 'Falhou'}`);
      console.log(`   - Nova expiração: ${newTokens.expiresAt}`);

    } catch (renewError) {
      console.log('❌ ERRO na renovação:');
      console.log(`   - Erro: ${renewError.message}`);
    }

    // 3. Verificar se há jobs agendados (simulado)
    console.log('\n📅 3. JOBS BULLMQ:');
    console.log('💡 Para verificar jobs reais, acesse dashboard BullMQ');
    console.log('   - URL: http://localhost:3003 (se dashboard estiver rodando)');
    console.log('   - Comando: npm run dev:dashboard');

  } catch (error) {
    console.error('❌ ERRO no sistema:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

checkRefreshSystem();
