# Integração Microsoft Teams

Esta integração permite ao sistema CONAB+ comunicar-se com o Microsoft Teams usando **delegated tokens** através da Microsoft Graph API.

> ⚠️ **CONFIGURAÇÃO ATUAL**: Esta integração está configurada para **uso interno apenas**.
> As rotas HTTP, controllers e middlewares estão comentados pois não são necessários.
> Para usar externamente via API, descomente os arquivos nas pastas `routes/`, `controllers/` e `middlewares/`.

## Funcionalidades

### ✅ Autenticação
- Login OAuth 2.0 com delegated tokens
- Renovação automática de access tokens
- Gerenciamento seguro de refresh tokens
- Validação de tokens em tempo real

### ✅ Mensagens e Chats
- Envio de mensagens de texto e HTML
- Criação de chats individuais e em grupo
- Envio de mensagens com anexos
- Listagem de chats do usuário
- Recuperação de histórico de mensagens

### ✅ Notificações
- Notificações de atividade personalizadas
- Templates para diferentes tipos de evento
- Integração com ordens de serviço
- Lembretes automáticos

### ✅ Presença
- Consulta de status de presença
- Definição de disponibilidade
- Monitoramento de atividade

### ✅ Busca de Usuários
- Busca por nome ou email
- Integração com Azure AD

## Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env`:

```env
# Microsoft Teams Integration
TEAMS_CLIENT_ID=your_application_client_id
TEAMS_CLIENT_SECRET=your_application_client_secret
TEAMS_TENANT_ID=your_tenant_id
TEAMS_REDIRECT_URI=http://localhost:3000/api/integrations/teams/auth/callback
```

### 2. Registro da Aplicação no Azure AD

1. Acesse o [Portal Azure](https://portal.azure.com)
2. Vá para **Azure Active Directory** > **App registrations**
3. Clique em **New registration**
4. Configure:
   - **Name**: CONAB+ Teams Integration
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: Web - `http://localhost:3000/api/integrations/teams/auth/callback`

### 3. Permissões Necessárias

Configure as seguintes **Delegated permissions**:

```
Microsoft Graph:
- User.Read
- Chat.ReadWrite
- ChatMessage.Send
- Presence.Read
- Presence.ReadWrite
- User.ReadBasic.All
- TeamworkActivity.Send
- offline_access (para refresh tokens)
```

### 4. Inicialização

O job de renovação automática de tokens pode ser iniciado no servidor:

```javascript
import tokenRefreshJob from './src/integrations/teams/utils/tokenRefreshJob';

// Inicia o job de renovação automática
tokenRefreshJob.start();
```

## Como Usar (Modo Interno)

### 1. Uso Direto dos Services

```javascript
// Importar os services necessários
import TeamsAuthService from '../integrations/teams/services/TeamsAuthService';
import TeamsService from '../integrations/teams/services/TeamsService';

// Exemplo: Enviar mensagem diretamente
await TeamsService.sendMessageToChat(
  'supervisor-user-id',
  'chat-id',
  'Olá! Nova ordem de serviço disponível.',
  'text'
);

// Exemplo: Verificar autenticação
const isAuthenticated = TeamsAuthService.isUserAuthenticated('user-id');
```

### 2. ~~Endpoints da API (COMENTADOS)~~

> As rotas HTTP estão comentadas. Para reativar:
> 1. Descomente os arquivos em `routes/`, `controllers/` e `middlewares/`
> 2. Descomente as importações no `app.js`

```javascript
// EXEMPLO DE ROTAS (comentadas atualmente):
// POST /api/integrations/teams/auth/initiate
// POST /api/integrations/teams/chat/send-message
// etc...
```

### 3. Criar Chat

```javascript
POST /api/integrations/teams/chat/create
{
  "userId": "user123",
  "participants": [
    { "email": "tecnico@empresa.com" },
    { "email": "supervisor@empresa.com" }
  ],
  "chatType": "group",
  "topic": "Ordem de Serviço #12345"
}
```

### 4. Enviar Notificação

```javascript
POST /api/integrations/teams/notification/send
{
  "userId": "user123",
  "targetUserId": "target-user-id",
  "topic": "Nova Ordem de Serviço",
  "activityType": "workOrderAssigned",
  "templateParameters": {
    "previewText": "Ordem #12345 atribuída a você",
    "workOrderNumber": "12345",
    "priority": "Alta"
  }
}
```

## Exemplos de Integração

### Notificação de Ordem de Serviço

```javascript
import TeamsService from './services/TeamsService';
import { createWorkOrderNotification } from './utils/teamsHelpers';

async function notifyWorkOrderAssignment(workOrder, technicianUserId) {
  try {
    // Criar notificação formatada
    const notification = createWorkOrderNotification(workOrder, technicianUserId);

    // Enviar notificação
    await TeamsService.sendActivityNotification(
      'supervisor-user-id',
      technicianUserId,
      notification.topic,
      notification.activityType,
      notification.templateParameters
    );

    console.log('Notificação enviada com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar notificação:', error.message);
  }
}
```

### Mensagem Formatada

```javascript
import { formatHTMLMessage, createNotificationMessage } from './utils/teamsHelpers';

// Mensagem HTML formatada
const message = formatHTMLMessage(
  'Ordem de Serviço #12345 finalizada',
  { bold: true, color: 'green' }
);

// Mensagem de notificação com ícone
const notification = createNotificationMessage(
  'success',
  'Ordem Finalizada',
  'A ordem de serviço #12345 foi concluída com sucesso.',
  'https://app.conabplus.com.br/work-orders/12345'
);
```

## Segurança

### Gerenciamento de Tokens
- Access tokens expiram em 1 hora
- Refresh tokens são válidos por até 90 dias
- Renovação automática 5 minutos antes da expiração
- Cache em memória (considere Redis para produção)

### Validações
- Sanitização de texto para prevenir injeção
- Validação de emails e participantes
- Middleware de autenticação obrigatória
- Logs de segurança detalhados

## Troubleshooting

### Erros Comuns

**401 - Token inválido:**
```javascript
// Usuário precisa realizar nova autenticação
POST /api/integrations/teams/auth/initiate
```

**Erro de permissões:**
- Verifique se todas as permissões delegadas foram concedidas
- Confirme se o admin fez grant das permissões

**Refresh token expirado:**
- Usuário precisa fazer login novamente
- Refresh tokens expiram após 90 dias de inatividade

### Logs

Todos os eventos são logados com diferentes níveis:

```javascript
// Sucesso
logEvent('info', 'TeamsService', 'Mensagem enviada com sucesso');

// Erro
logEvent('error', 'TeamsService', 'Erro ao enviar mensagem: Token expirado');

// Warning
logEvent('warning', 'TeamsService', 'Token próximo do vencimento');
```

## Monitoramento

### Estatísticas de Tokens

```javascript
import tokenRefreshJob from './utils/tokenRefreshJob';

// Obter estatísticas
const stats = tokenRefreshJob.getTokenStats();
console.log(stats);
// {
//   total: 10,
//   expired: 1,
//   expiringSoon: 2,
//   expiringToday: 3,
//   healthy: 4
// }
```

### Limpeza Automática

```javascript
// Remove tokens expirados há mais de 24h
const cleaned = tokenRefreshJob.cleanupExpiredTokens();
console.log(`${cleaned} tokens removidos`);
```

## Melhorias Futuras

- [ ] Persistência de tokens em banco de dados
- [ ] Webhooks para receber mensagens
- [ ] Suporte a Adaptive Cards
- [ ] Integração com Microsoft Planner
- [ ] Criação de reuniões online
- [ ] Bot para interações automatizadas

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs da aplicação
2. Confirme as configurações do Azure AD
3. Teste a conectividade com o Microsoft Graph
4. Consulte a [documentação oficial](https://docs.microsoft.com/graph/)
