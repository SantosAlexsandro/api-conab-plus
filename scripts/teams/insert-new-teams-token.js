// Script para inserir novo token Teams obtido via Postman
import dotenv from 'dotenv';

// IMPORTANTE: Carregar .env ANTES de qualquer import que use variáveis de ambiente
dotenv.config();

import '../../src/database/index.js';
import TeamsToken from '../../src/models/TeamsToken.js';
import TeamsAuthService from '../../src/integrations/teams/services/TeamsAuthService.js';
import { scheduleUserTokenRefresh, cancelUserRefreshJobs } from '../../src/integrations/teams/queues/teamsTokenRefreshQueue.js';

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
      accessToken: 'eyJ0eXAiOiJKV1QiLCJub25jZSI6IlpELUtuM3JKMEFrVWk0d2ZwZGQ0cm8tVVhmZjJiX09Rc29QRTBMdnYwaGMiLCJhbGciOiJSUzI1NiIsIng1dCI6IkNOdjBPSTNSd3FsSEZFVm5hb01Bc2hDSDJYRSIsImtpZCI6IkNOdjBPSTNSd3FsSEZFVm5hb01Bc2hDSDJYRSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9mYzRlYzdiNC1jZWFkLTQ5YjgtODFhNi1hNmEwYjljNTcwMmQvIiwiaWF0IjoxNzQ5MjY3NjY1LCJuYmYiOjE3NDkyNjc2NjUsImV4cCI6MTc0OTI3MjA4NywiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkFYUUFpLzhaQUFBQXNHT0pnbytJQWN2SWlhQ0xhT3Znc01SZVhvbjJDZndJb0lWZGhDRGoyd041TDBFVXVMMHQ4OVgvbTU4c241MjJ1NzJzSTNuUG9zOVZ1OEwxZjFYdzB5ZjJVellrU1BMbm1ZcHBHLzdQY21Fdkc4ZTAwOXdqTkhtRnlVRVdPZzVZNUtIaE50blFyREdsS01FSktxVDRiUT09IiwiYW1yIjpbInB3ZCJdLCJhcHBfZGlzcGxheW5hbWUiOiJDb25hYisgVGVhbXMgQXBwIiwiYXBwaWQiOiI2NTZmZmNjMi0zMGU2LTRlNjUtYWI4My02OWJlYTlhNDQ0YzgiLCJhcHBpZGFjciI6IjEiLCJkZXZpY2VpZCI6IjU3MWEwNjk5LWVhZTctNGMzZS05MTMyLTU1YjUxYjRlZjAzMSIsImZhbWlseV9uYW1lIjoiUGx1cysrIiwiZ2l2ZW5fbmFtZSI6IkNvbmFiIiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiMjgwNDoxNGM6MjI1OjgzNTA6NmNkOTpjNDRkOmMzODk6OTZiNiIsIm5hbWUiOiJDb25hYiBQbHVzIiwib2lkIjoiZGM5MTFiNjYtNTgxMS00MzRlLTg5MjUtYmMwZWIwYWExNGIyIiwib25wcmVtX3NpZCI6IlMtMS01LTIxLTEwNDI2MTQ1MjItMTM0MjM1NTY3Ny03MjgzNTcwNzAtMTM3MTciLCJwbGF0ZiI6IjMiLCJwdWlkIjoiMTAwMzIwMDRCMjgzRkYxRSIsInJoIjoiMS5BU1VBdE1kT19LM085RW1CcHFhZ3VjVndMUU1BQUFBQUFBQUF3QUFBQUFBQUFBQWxBRm9sQUEuIiwic2NwIjoiQ2hhdC5DcmVhdGUgQ2hhdC5SZWFkV3JpdGUgQ2hhdC5SZWFkV3JpdGUuQWxsIENoYXRNZXNzYWdlLlNlbmQgVXNlci5SZWFkIFVzZXIuUmVhZC5BbGwgcHJvZmlsZSBvcGVuaWQgZW1haWwiLCJzaWQiOiIwMDVjN2ZjOS0xMTE4LTYwM2ItYTM2OS02ZDQ1OTBiODM5ODAiLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJGTmdEdG1MMzZDSVhjZFpiYUk1aTlVVUdZcjBVenJ5MVNuZDZfblNveEZjIiwidGVuYW50X3JlZ2lvbl9zY29wZSI6IlNBIiwidGlkIjoiZmM0ZWM3YjQtY2VhZC00OWI4LTgxYTYtYTZhMGI5YzU3MDJkIiwidW5pcXVlX25hbWUiOiJjb25hYnBsdXNAY29uYWIuY29tLmJyIiwidXBuIjoiY29uYWJwbHVzQGNvbmFiLmNvbS5iciIsInV0aSI6Ik00c0hNbHYwTFVDRHl4RlBIRXRSQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfZnRkIjoicWtUYXNVdmM5TXBnWkZEd283NnY3NHdtdGR5Q2VtTGN5YzJUVndCcnl0Z0JkWE51YjNKMGFDMWtjMjF6IiwieG1zX2lkcmVsIjoiMSAyNiIsInhtc19zdCI6eyJzdWIiOiI5a1czYWdIa3RHOTh5WUk4WW1nMDNVRnRLdkFCTkFzZE10SGdTVjVOQ0c4In0sInhtc190Y2R0IjoxNTQwNDg3ODA1fQ.OSs-QFo6uuKg6wd19lI3o3GUn1k5yPuXrcCgdxFyPzXQQ4pCzth5i3plzCGEtVT1_xVFMnhwO5ShTldVJ-OCO3_t8QURReVOhF2T7b_8mIfTt9Vbt180vJO4m9o3tfd8BqeCWXbiwBFRDbg3nFZ4Jrjo39XciAy-yEQatvD0BG_a4mtCMBUpvE2XxoKwp_FHIXX4mML6IQsKwVlItzBW224s4iYrKT7MGl1PkD7zAaeSZ6kyFFz6p0tOiNmW8phsmgh3nsUojVohNkeszpLb7fF-ug7TBBo_bdts20zzFfaRYr1AFyS-HvMwEa5F3b-K_yX8gKN4yi5VF5BeZgLwag',
      refreshToken: '1.ASUAtMdO_K3OuEmBpqagucVwLcL8b2XmMGVOq4NpvqmkRMglAFolAA.AgABAwEAAABVrSpeuWamRam2jAF1XRQEAwDs_wUA9P8M6QRFTuZgH_3j4VB7gIAKzen69lCsuUkCCVORhAOdNwjl4VS7Q2-QJn48B_fKtIPcTD5pxBbFts-lCLfzrTrbW3K4lAvPUx7SLuVh2kAZE4VtiyRQ0MtVHUCb2WAP6wq5R7Bu8cA0QSQVZoBCud1TeeOrRRs-wzFng6nRapdcXM3I86bK9uQR1k043tK4dCh7kYulN93ChffariAFU5jpY_u1v170pdGz8fPwRxuJikFvPNU2bdZuRR0hM6HBWXYNi8hF61lHZ4o96BqkpYVVQSg34UwUYFEzUMNHAgePLePVm0pFfe8bVk_L_dqC_GFdiFDo0wesZVz_bDs7t0hE7Eb3_NtYHcz8wBFHOYc9vxKcQG2LqcGixkRPf5c4i_z4N5lJRZspSr-yHUFg732Dj6XsdjRcKHm36ptAu3d-Ylik3tm8IUSkyT_uNew5PY92C3gg1D3533nBBsAfyiznbQvJQ4l5m_W3gAzfnk22Q1KCcIRD17navBp5CKGnBmue2bmFheADR20xnl_ZYmKZSfWkLk0FxZDbRxN6pQ_d3DLZg_p1SqrWJA7WHBhlrY5ZB3nGnF2PZR_TNg_vrzqXhrqjPRAf_HdVxNi6AOqe4sxWKuU2GlfBoIUbMLwgZVPRryJC17TKFNpJDPDEUbesJiR7ef8ohaT6NjM7VEfjzlxM0rzvdAbrgoscL8N2Jg-l81jdF_8U1Wm3LKhRDQsZV5IWeG88nkNGdyrp7kuZzJjhdUD03ESLBzor2m1HvT0XCTYGfnUPYB7RBUXHMntfNH8Rgkx8HGNSh7FEypxKf55SYdxFOUWAGO1ak-YjM8SLsJ_OEUAwDhYCuonfh8TQBSe4QiFKnvpa-uBsZ2aBNNuCdxhk6num0kinY0H9h9P6LQkcToWLvliA4FAN8zhAlDDfDguC',
      tokenType: 'Bearer',
      scope: 'profile openid email https://graph.microsoft.com/Chat.Create https://graph.microsoft.com/Chat.ReadWrite https://graph.microsoft.com/Chat.ReadWrite.All https://graph.microsoft.com/ChatMessage.Send https://graph.microsoft.com/User.Read https://graph.microsoft.com/User.Read.All',
      expiresIn: 4121, // segundos
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
