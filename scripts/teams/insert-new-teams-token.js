// Script para inserir novo token Teams obtido via Postman
import dotenv from 'dotenv';

// IMPORTANTE: Carregar .env ANTES de qualquer import que use variáveis de ambiente
dotenv.config();

import './src/database/index.js';
import TeamsToken from './src/models/TeamsToken.js';
import TeamsAuthService from './src/integrations/teams/services/TeamsAuthService.js';
import { scheduleUserTokenRefresh, cancelUserRefreshJobs } from './src/integrations/teams/queues/teamsTokenRefreshQueue.js';

const TIMEZONE_BRASILIA = 'America/Sao_Paulo';

function formatBrazilianTime(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIMEZONE_BRASILIA,
    dateStyle: 'short',
    timeStyle: 'medium'
  }).format(date);
}

async function insertNewTeamsToken() {
  try {
    console.log('🔄 INSERINDO NOVO TOKEN TEAMS (VIA POSTMAN)\n');

    // Dados do novo token fornecido pelo usuário
    const newTokenData = {
      userId: 'work_order_bot',
      accessToken: 'eyJ0eXAiOiJKV1QiLCJub25jZSI6InFXTHNzWU5TRDFjTXBwdlctWUhHWjZpTkVCVGZxVzlpdzhNczZkOVBlT0kiLCJhbGciOiJSUzI1NiIsIng1dCI6IkNOdjBPSTNSd3FsSEZFVm5hb01Bc2hDSDJYRSIsImtpZCI6IkNOdjBPSTNSd3FsSEZFVm5hb01Bc2hDSDJYRSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9mYzRlYzdiNC1jZWFkLTQ5YjgtODFhNi1hNmEwYjljNTcwMmQvIiwiaWF0IjoxNzQ5MjYwMjk2LCJuYmYiOjE3NDkyNjAyOTYsImV4cCI6MTc0OTI2NDc4NCwiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkFYUUFpLzhaQUFBQXpYSGVLWVJKWTBhN1d2Q3FWYmlBSTJJdGxHUC9CTkhUSE1XZnVySktISjQvb1Q3aUtKeVQ1cmNJS3VYdjNrMmNuYi8vV0VIbVZjc3MyVm40N3pIR3hFNC9Oa21WbWJXckV0dEcrU3ZhZVI4dElBTmZCREJTc3pYY2Fzd1dqMDFaTkJHemc5QVpGQnZpeDMrUjAzMFg4UT09IiwiYW1yIjpbInB3ZCJdLCJhcHBfZGlzcGxheW5hbWUiOiJDb25hYisgVGVhbXMgQXBwIiwiYXBwaWQiOiI2NTZmZmNjMi0zMGU2LTRlNjUtYWI4My02OWJlYTlhNDQ0YzgiLCJhcHBpZGFjciI6IjEiLCJkZXZpY2VpZCI6IjU3MWEwNjk5LWVhZTctNGMzZS05MTMyLTU1YjUxYjRlZjAzMSIsImZhbWlseV9uYW1lIjoiUGx1cysrIiwiZ2l2ZW5fbmFtZSI6IkNvbmFiIiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiMjgwNDoxNGM6MjI1OjgzNTA6NmNkOTpjNDRkOmMzODk6OTZiNiIsIm5hbWUiOiJDb25hYiBQbHVzIiwib2lkIjoiZGM5MTFiNjYtNTgxMS00MzRlLTg5MjUtYmMwZWIwYWExNGIyIiwib25wcmVtX3NpZCI6IlMtMS01LTIxLTEwNDI2MTQ1MjItMTM0MjM1NTY3Ny03MjgzNTcwNzAtMTM3MTciLCJwbGF0ZiI6IjMiLCJwdWlkIjoiMTAwMzIwMDRCMjgzRkYxRSIsInJoIjoiMS5BU1VBdE1kT19LM091RW1CcHFhZ3VjVndMUU1BQUFBQUFBQUF3QUFBQUFBQUFBQWxBRm9sQUEuIiwic2NwIjoiQ2hhdC5DcmVhdGUgQ2hhdC5SZWFkV3JpdGUgQ2hhdC5SZWFkV3JpdGUuQWxsIENoYXRNZXNzYWdlLlNlbmQgVXNlci5SZWFkIFVzZXIuUmVhZC5BbGwgcHJvZmlsZSBvcGVuaWQgZW1haWwiLCJzaWQiOiIwMDVjN2ZjOS0xMTE4LTYwM2ItYTM2OS02ZDQ1OTBiODM5ODAiLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJGTmdEdG1MMzZDSVhjZFpiYUk1aTlVVUdZcjBVenJ5MVNuZDZfblNveEZjIiwidGVuYW50X3JlZ2lvbl9zY29wZSI6IlNBIiwidGlkIjoiZmM0ZWM3YjQtY2VhZC00OWI4LTgxYTYtYTZhMGI5YzU3MDJkIiwidW5pcXVlX25hbWUiOiJjb25hYnBsdXNAY29uYWIuY29tLmJyIiwidXBuIjoiY29uYWJwbHVzQGNvbmFiLmNvbS5iciIsInV0aSI6Ilg2QXlEbEdLRjBTN2FTVGFvS1RDQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfZnRkIjoic05FWlZxaGc0MlhONmZCWm9fWXAwcXd1YkVfbDJQU0dmaTRicjU0NHhKVUJkWE4zWlhOME15MWtjMjF6IiwieG1zX2lkcmVsIjoiMSAyMCIsInhtc19zdCI6eyJzdWIiOiI5a1czYWdIa3RHOTh5WUk4WW1nMDNVRnRLdkFCTkFzZE10SGdTVjVOQ0c4In0sInhtc190Y2R0IjoxNTQwNDg3ODA1fQ.UoqDWMRaKkc9H90cpCnBNrgdxMlVZ8PTRCMB9fbxo9mY1bXe5TB-oKbNRfdA1TphIyg-rhHzr5QokJQVYA-hANZlJsddQnE8tjQeKKoxs05RbLrYCWUrHWa0OZm5TiQ3WKJ4ILrT2Eu5Xuslh0IW3BZ02EL3u_fvTzuOQcbqq6yPaxpk7mB1OBTrsTrUBCaHgZ1ZOEj2EZYnvKUo3hBe1K2YlrQEWnhwmYvl7bG4b8ugtadmXggvAfik6aH3LF7XzYTF68cPi5DDgyWyHfyyeYYiLGF0N2D4YjidvPkydG1ogZ08qQzgyMKvYgRdBTibL-TRuM9xW5Fiycn8GtK0Tw',
      refreshToken: '1.ASUAtMdO_K3OuEmBpqagucVwLcL8b2XmMGVOq4NpvqmkRMglAFolAA.AgABAwEAAABVrSpeuWamRam2jAF1XRQEAwDs_wUA9P-PMeGVraw1cH6TTbYJayNI04_R5qEELxxfOjpfHqBn7YsqPOD8XNkw6UN1vjQfG3Z1dfU1__vHuHXQ2rbDME1I-0KWOpAD2Zfo4Sax4njvVxYRUP4OU2ZMfAIYgjrDJ8JWeXQGY4xrPZWoKS-wilTS65GRXVeJlqD0_W8Ud63PqTw20FjZdzfMxiq2hUgeDgyPzK-lHuHmM3Hom9jACGUFOw_pi-WM3vGp8z0oMAmTjZTZWIBhWND2thw2Q4fx4NXKUYG_ivb5JNSNvy3ky-iapOXwp75rxYtBNnrS_6Bm_GFavQ6c486QQv4WRTM4sMxU-7B2dyqIeJiT71nXxpT7BjmWTRilwdITAARLA2njksdduGk-jrGLol2HMr61R7HaYgEKYybm3EPIPUecZQjiDqMWI1__IIav7i6ZnO-3z4GvKv6ADdv-rbxaoM1eksRdaeLU8GKuKD8Hl-OIOitE2xyodhJoAVNjzDEBefqzeuUjXpaC_6GmVdNjaiZTfnyNNNjaf5T30krztIN5NuPmF3JL48sF9LZAQvdaeg5st0DR5SfIMe5kXmqKxmVVMtcSI2LZu5c8V9wUr5tpVYXGouerEwjNMc7-boPZZLLfPZWY51Qo94ckHBzS10ctpf0u6XdzZ85bDQBOnpk_wFpCJ3C9ro3K88BlY-Nxa0hMdDwfrkziydfWLtys5hFGwrARf9fyz9j5Jz8EiJVPraUbDk4h94UYDKjhrbCPndlXJzLonI4ZVXFf7GUli-I5YHRhqW6L98r1km1G7041PIOFHWVWXS9w_yRcBUuCyLRZ_xWPDeV7ltzphIQx9T60GzFZPy66k8aOK_fFoBk-qP7UgtNCaUJCkgJfpvfKN6SZzaeVSSt0-9YKgKR4XJjg7PVRiuI7H3iTKuIF0SI1Z7q98evs9fam',
      tokenType: 'Bearer',
      scope: 'profile openid email https://graph.microsoft.com/Chat.Create https://graph.microsoft.com/Chat.ReadWrite https://graph.microsoft.com/Chat.ReadWrite.All https://graph.microsoft.com/ChatMessage.Send https://graph.microsoft.com/User.Read https://graph.microsoft.com/User.Read.All',
      expiresIn: 4187, // segundos
      timestamp: Date.now() // milissegundos - usar timestamp atual
    };

    // Calcular data de expiração
    const expiresAt = new Date(newTokenData.timestamp + (newTokenData.expiresIn * 1000));
    const now = new Date();
    const timeUntilExpiry = Math.round((expiresAt - now) / (1000 * 60));

    console.log('📋 INFORMAÇÕES DO NOVO TOKEN:');
    console.log(`   Usuário: ${newTokenData.userId}`);
    console.log(`   Tipo: ${newTokenData.tokenType}`);
    console.log(`   Scopes: ${newTokenData.scope}`);
    console.log(`   Expira em: ${formatBrazilianTime(expiresAt)}`);
    console.log(`   Tempo restante: ${timeUntilExpiry} minutos`);

    if (timeUntilExpiry <= 0) {
      console.log('\n⚠️ ATENÇÃO: Token já expirado!');
      console.log('💡 Você precisa obter um novo token válido');
      return;
    }

    // 1. Cancelar jobs existentes
    console.log('\n🧹 1. CANCELANDO JOBS EXISTENTES:');
    await cancelUserRefreshJobs(newTokenData.userId);
    console.log('   ✅ Jobs cancelados');

    // 2. Inserir/atualizar token no banco
    console.log('\n💾 2. SALVANDO TOKEN NO MYSQL:');
    try {
      const [instance, created] = await TeamsToken.upsert({
        user_id: newTokenData.userId,
        access_token: newTokenData.accessToken,
        refresh_token: newTokenData.refreshToken, // ← CORRIGIDO: usar refreshToken real
        token_type: newTokenData.tokenType,
        scope: newTokenData.scope,
        expires_at: expiresAt,
        expires_in: newTokenData.expiresIn,
        is_active: true
      }, {
        returning: true,
        conflictFields: ['user_id']
      });

      console.log(`   ✅ Token ${created ? 'criado' : 'atualizado'} no MySQL (ID: ${instance.id})`);

    } catch (dbError) {
      console.error(`   ❌ Erro no MySQL: ${dbError.message}`);
      throw dbError;
    }

    // 3. Cache removido temporariamente para debug
    console.log('\n🧠 3. CACHE REMOVIDO TEMPORARIAMENTE PARA DEBUG');
    const teamsService = new TeamsAuthService();
    console.log('   ✅ TeamsAuthService instanciado (sem cache)');

    // 4. Verificar se é possível renovação automática
    console.log('\n⏰ 4. VERIFICANDO RENOVAÇÃO AUTOMÁTICA:');
    if (!newTokenData.refreshToken || newTokenData.refreshToken.trim() === '') {
      console.log('   ⚠️ Token SEM refresh_token - NÃO É POSSÍVEL renovação automática');
      console.log('   ⚠️ Após expirar (~79 min), será necessário novo token via OAuth');
      console.log('   ⚠️ Sistema funcionará APENAS até a expiração');
    } else if (timeUntilExpiry > 15) {
      try {
        await scheduleUserTokenRefresh(newTokenData.userId, expiresAt);
        const renewTime = new Date(expiresAt.getTime() - (10 * 60 * 1000));
        console.log(`   ✅ Renovação agendada para: ${formatBrazilianTime(renewTime)}`);
      } catch (scheduleError) {
        console.warn(`   ⚠️ Erro ao agendar renovação: ${scheduleError.message}`);
      }
    } else {
      console.log('   ⚠️ Token expira em breve, renovação será executada imediatamente');
    }

    // 5. Teste de funcionamento
    console.log('\n🧪 5. TESTE DE FUNCIONAMENTO:');
    try {
      const isAuthenticated = await teamsService.isUserAuthenticated(newTokenData.userId);
      console.log(`   Autenticação: ${isAuthenticated ? '✅' : '❌'}`);

      if (isAuthenticated) {
        const validToken = await teamsService.getValidAccessToken(newTokenData.userId);
        console.log(`   Token válido: ${validToken ? '✅' : '❌'}`);
      }
    } catch (testError) {
      console.log(`   ❌ Erro no teste: ${testError.message}`);
    }

        console.log('\n🎉 RESULTADO FINAL:');
    console.log('═══════════════════════════════════════');
    console.log('✅ NOVO TOKEN INSERIDO COM SUCESSO!');

    if (!newTokenData.refreshToken || newTokenData.refreshToken.trim() === '') {
      console.log('⚠️ ATENÇÃO: Token TEMPORÁRIO (sem renovação automática)');
      console.log('📱 Notificações Teams funcionarão por ~79 minutos APENAS');
      console.log('🚫 Sistema NÃO se renovará automaticamente');
    } else {
      console.log('🔄 Sistema de renovação automática reativado');
      console.log('📱 Notificações Teams funcionando normalmente');
      console.log('⏰ Próxima renovação agendada automaticamente');
    }

    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('- Use `npm run teams:test` para testar notificação');

    if (newTokenData.accessToken && !newTokenData.refreshToken) {
      console.log('- ⚠️ Após ~79 min, obtenha novo token via OAuth');
      console.log('- ⚠️ Para sistema permanente, use fluxo OAuth completo');
    } else {
      console.log('- Use dashboard BullMQ para monitorar renovações');
      console.log('- Sistema funcionará automaticamente daqui para frente');
    }

    console.log('\n⚠️ LIMITAÇÃO ATUAL:');
    console.log('Este tipo de token (via Postman) não possui refresh_token:');
    console.log('- ✅ Funciona perfeitamente por ~79 minutos');
    console.log('- ❌ NÃO pode ser renovado automaticamente');
    console.log('- 💡 Para renovação automática, implemente OAuth completo');

  } catch (error) {
    console.error('❌ Erro na inserção do token:', error.message);
  } finally {
    process.exit(0);
  }
}

insertNewTeamsToken();
