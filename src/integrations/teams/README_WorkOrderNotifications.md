# Notificações de Work Orders no Teams

## Descrição

Sistema automatizado que envia notificações para um grupo específico do Microsoft Teams sempre que:
- Uma nova ordem de serviço é criada
- Um técnico é atribuído a uma ordem

As notificações são enviadas para o chat: `19:b2f438dde3f74c5daf960d92dbecf443@thread.v2`

## Configuração

### 1. Variáveis de Ambiente

```bash
# Adicione ao .env
TEAMS_NOTIFICATION_USER_ID=work_order_bot
```

### 2. Autenticação do Bot

```javascript
import setup from './examples/setupWorkOrderNotifications.js';

// 1. Configurar usuário
const config = await setup.setupNotificationUser('work_order_bot');

// 2. Se precisar autenticar, abra a URL retornada e complete
if (config.step === 'authentication_required') {
  console.log('Abra:', config.authUrl);
  // Após autorização, complete com o código
  await setup.completeAuth('work_order_bot', 'CODIGO_DO_CALLBACK');
}

// 3. Testar
await setup.testNotification();
```

## Funcionamento

### Criação de Work Order
Quando uma work order é criada no g4flex, uma notificação é automaticamente enviada com:
- Número da OS
- Cliente
- Prioridade
- Contato
- Status (Aguardando Técnico)

### Atribuição de Técnico
Quando um técnico é atribuído, outra notificação é enviada com:
- Número da OS
- Nome do técnico
- Cliente
- Status (Técnico Atribuído)

## Estrutura Técnica

```
teams/
├── services/
│   └── TeamsWorkOrderNotificationService.js   # Serviço principal
├── examples/
│   └── setupWorkOrderNotifications.js         # Script de configuração
└── README_WorkOrderNotifications.md           # Esta documentação
```

## Integração com g4flex

O sistema está integrado automaticamente no worker de work orders:
- `processCreateWorkOrder()` - Envia notificação após criação
- `processAssignTechnician()` - Envia notificação após atribuição

## Troubleshooting

### Token Expirado
- O sistema BullMQ renova automaticamente os tokens
- Em caso de falha, reautentique o usuário

### Falha na Notificação
- Verifique se o usuário bot tem acesso ao chat
- As falhas não afetam o processamento das work orders

### Chat Não Encontrado
- Verifique se o ID do chat está correto
- Confirme que o usuário bot foi adicionado ao grupo
