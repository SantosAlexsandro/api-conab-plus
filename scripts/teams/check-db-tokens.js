import dotenv from 'dotenv';
dotenv.config();

import '../../src/database/index.js';
import TeamsToken from '../../src/models/TeamsToken.js';

async function checkTokens() {
  try {
    console.log('🔍 Verificando tokens no banco de dados...\n');

    const tokens = await TeamsToken.findAll({
      attributes: ['user_id', 'expires_at', 'is_active', 'created_at'],
      raw: true
    });

    if (tokens.length === 0) {
      console.log('❌ Nenhum token encontrado no banco');
      return;
    }

    console.log(`✅ Encontrados ${tokens.length} token(s):\n`);

    tokens.forEach((token, index) => {
      const now = new Date();
      const expiresAt = new Date(token.expires_at);
      const isExpired = expiresAt <= now;
      const timeLeft = Math.max(0, Math.floor((expiresAt - now) / (1000 * 60)));

      console.log(`📄 Token ${index + 1}:`);
      console.log(`   👤 User ID: ${token.user_id}`);
      console.log(`   ⏰ Expira em: ${expiresAt.toLocaleString('pt-BR')}`);
      console.log(`   🟢 Ativo: ${token.is_active ? 'Sim' : 'Não'}`);
      console.log(`   ⏱️  Status: ${isExpired ? '❌ Expirado' : `✅ Válido (${timeLeft} min restantes)`}`);
      console.log(`   📅 Criado em: ${new Date(token.created_at).toLocaleString('pt-BR')}\n`);
    });

    // Testar especificamente o work_order_bot
    console.log('🤖 Testando work_order_bot especificamente...');
    const workOrderBot = await TeamsToken.findOne({
      where: { user_id: 'work_order_bot', is_active: true }
    });

    if (workOrderBot) {
      console.log('✅ work_order_bot encontrado e ativo');
      console.log(`   Refresh token presente: ${workOrderBot.refresh_token ? 'Sim' : 'Não'}`);
      console.log(`   Tamanho refresh token: ${workOrderBot.refresh_token?.length || 0} chars`);
    } else {
      console.log('❌ work_order_bot não encontrado ou inativo');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar tokens:', error.message);
  } finally {
    process.exit(0);
  }
}

checkTokens();
