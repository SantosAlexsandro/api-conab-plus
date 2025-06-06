# 🚀 Guia de Configuração Teams - Work Orders

## ✅ **O que você precisa fazer:**

### **1. Configurar Azure AD (OBRIGATÓRIO)**

1. **Acesse**: [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
2. **Crie nova aplicação**:
   - Nome: `CONAB+ Teams Integration`
   - Tipos de conta: `Single tenant`
   - Redirect URI: `Web` → `http://localhost:3000/auth/teams/callback`

3. **Configure permissões API**:
   - Microsoft Graph → Delegated permissions:
     - ✅ `User.Read`
     - ✅ `Chat.ReadWrite`
     - ✅ `ChatMessage.Send`
     - ✅ `offline_access`

4. **Gere Client Secret**:
   - Certificates & secrets → New client secret
   - **ANOTE O VALOR** (aparece só uma vez!)

5. **Anote informações importantes**:
   - Application (client) ID
   - Directory (tenant) ID
   - Client secret value

### **2. Configurar Variáveis de Ambiente**

Adicione ao seu arquivo `.env`:

```bash
# ========= TEAMS INTEGRATION =========
TEAMS_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
TEAMS_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TEAMS_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
TEAMS_REDIRECT_URI=http://localhost:3000/auth/teams/callback
TEAMS_NOTIFICATION_USER_ID=work_order_bot
```

### **3. Executar Configuração**

Execute os comandos abaixo **NA ORDEM**:

```bash
# 1. Gerar URL de autorização
node -e "
import('./src/integrations/teams/services/TeamsAuthService.js').then(service => {
  const auth = service.default;
  const url = auth.generateAuthUrl('work_order_bot');
  console.log('🔗 URL DE AUTORIZAÇÃO:');
  console.log(url);
  console.log('\\n📋 PRÓXIMOS PASSOS:');
  console.log('1. Abra a URL acima no navegador');
  console.log('2. Faça login com conta que tem acesso ao grupo Teams');
  console.log('3. Autorize a aplicação');
  console.log('4. Copie o CÓDIGO da URL de callback');
  console.log('5. Execute: npm run teams:complete CODIGO_AQUI');
}).catch(err => console.error('❌ Erro:', err.message));
"

# 2. Após obter o código, execute:
# npm run teams:complete SEU_CODIGO_AQUI
```

### **4. Scripts Facilitadores**

Adicione estes scripts ao `package.json`:

```json
{
  "scripts": {
    "teams:setup": "node -e \"import('./src/integrations/teams/services/TeamsAuthService.js').then(s => console.log('URL:', s.default.generateAuthUrl('work_order_bot')))\"",
    "teams:complete": "node -e \"const code = process.argv[2]; if(!code) { console.error('❌ Forneça o código!'); process.exit(1); } import('./src/integrations/teams/examples/setupWorkOrderNotifications.js').then(async s => { await s.default.completeAuth('work_order_bot', code); console.log('✅ Pronto!'); })\"",
    "teams:test": "node -e \"import('./src/integrations/teams/examples/setupWorkOrderNotifications.js').then(async s => { await s.default.testNotification(); })\"",
    "teams:status": "node -e \"import('./src/integrations/teams/examples/setupWorkOrderNotifications.js').then(async s => { await s.default.checkStatus(); })\""
  }
}
```

### **5. Verificação**

Após configurar, teste:

```bash
npm run teams:test    # Envia teste
npm run teams:status  # Verifica configuração
```

## 🎯 **Resultado Esperado**

✅ **Notificações automáticas** para o grupo Teams:
- Quando nova work order é criada
- Quando técnico é atribuído

✅ **Chat de destino**: `19:b2f438dde3f74c5daf960d92dbecf443@thread.v2`

## ❌ **Troubleshooting**

### Erro: "Usuário não autenticado"
- Execute novamente a configuração
- Verifique se as variáveis .env estão corretas

### Erro: "Chat não encontrado"
- Verifique se o usuário tem acesso ao grupo
- Confirme o ID do chat está correto

### Erro: "Token expirado"
- O BullMQ renova automaticamente
- Se persistir, reautentique o usuário

## 🔄 **Funcionamento Automático**

Após configuração, o sistema funciona **automaticamente**:

1. **Work Order criada** → Notificação enviada
2. **Técnico atribuído** → Notificação enviada
3. **Token expirando** → BullMQ renova automaticamente

**Não requer mais intervenção manual!** 🎉
