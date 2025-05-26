# Notificações Push - ConabPlus

Este documento explica como usar o sistema de notificações push implementado no ConabPlus.

## Visão Geral

O sistema de notificações push utiliza o protocolo Web Push para enviar notificações aos usuários, mesmo quando eles não estão com o aplicativo aberto no navegador. O sistema segue as melhores práticas do ecossistema Web e utiliza:

- Service Worker para receber e exibir notificações
- Push API com PushSubscription para registrar o dispositivo
- Chaves VAPID para autenticação entre cliente e servidor
- Web-push para gerenciar o envio de notificações do lado do servidor

## Requisitos

- O aplicativo deve estar sendo servido em HTTPS (exceto em localhost)
- Os navegadores dos usuários devem suportar Push API e Notification API
- O backend deve estar configurado com chaves VAPID válidas

## Configuração do Backend

1. **Gerar as chaves VAPID**:
   ```bash
   npm run generate-vapid-keys
   ```

2. **Adicionar as chaves ao arquivo .env**:
   ```
   VAPID_PUBLIC_KEY=sua_chave_publica_aqui
   VAPID_PRIVATE_KEY=sua_chave_privada_aqui
   VAPID_SUBJECT=mailto:contato@conabplus.com.br
   ```

## Uso no Backend

### Enviar Notificações via Controlador

O sistema possui um controlador `PushNotificationController` com os seguintes endpoints:

- `GET /notifications/vapid-public-key` - Retorna a chave pública VAPID
- `POST /notifications/subscribe` - Registra uma nova assinatura
- `POST /notifications/unsubscribe` - Cancela uma assinatura
- `GET /notifications/subscriptions` - Lista todas as assinaturas
- `POST /notifications/send` - Envia uma notificação para assinantes

### Enviar Notificações via Serviço

O sistema também possui um serviço `PushNotificationService` que pode ser usado diretamente em qualquer parte do código:

```javascript
import PushNotificationService from '../services/PushNotificationService';

// Enviar para todos os usuários
await PushNotificationService.sendToAll({
  title: 'Título da notificação',
  body: 'Corpo da mensagem',
  data: {
    // Dados adicionais que serão enviados como payload
    type: 'notification_type',
    id: 123,
    url: '/pagina-destino'
  }
});

// Enviar para um usuário específico
await PushNotificationService.sendToUser(userId, {
  title: 'Título da notificação',
  body: 'Corpo da mensagem'
});

// Enviar para um endpoint específico
await PushNotificationService.sendToEndpoint(endpoint, {
  title: 'Título da notificação',
  body: 'Corpo da mensagem'
});
```

## Integração com g4Flex

### Notificações para Ordens de Serviço

O sistema está integrado com o g4Flex para enviar notificações automaticamente quando:

1. **Nova ordem de serviço criada** - Quando uma ordem de serviço é criada através da integração g4Flex
   - Localização: `api-conab+/src/integrations/g4flex/services/WorkOrderService.js`
   - Método: `createWorkOrder()`
   - Notificação enviada para: Todos os usuários ativos

2. **Técnico atribuído à ordem de serviço** - Quando um técnico é atribuído a uma ordem de serviço
   - Localização: `api-conab+/src/integrations/g4flex/services/WorkOrderService.js`
   - Método: `assignTechnicianToWorkOrder()`
   - Notificação enviada para: Todos os usuários ativos

### Exemplo de Notificação para Ordem de Serviço

**Criação de Ordem de Serviço:**
```javascript
await pushNotificationService.sendToAll({
  title: 'Nova Ordem de Serviço Criada',
  body: `Ordem de Serviço ${workOrderNumber} foi criada para ${customerName}`,
  icon: '/icons/icon-192x192.png',
  tag: 'work-order-created',
  data: {
    type: 'work_order_created',
    workOrderNumber: workOrderNumber,
    customerName: customerName,
    uraRequestId: uraRequestId,
    url: `/trabalho-ordens/${workOrderNumber}`
  }
});
```

**Atribuição de Técnico:**
```javascript
await pushNotificationService.sendToAll({
  title: 'Técnico Atribuído',
  body: `Técnico ${technicianName} foi atribuído à Ordem de Serviço ${workOrderNumber}`,
  icon: '/icons/icon-192x192.png',
  tag: 'technician-assigned',
  data: {
    type: 'technician_assigned',
    workOrderNumber: workOrderNumber,
    technicianName: technicianName,
    technicianId: technicianId,
    uraRequestId: uraRequestId,
    url: `/trabalho-ordens/${workOrderNumber}`
  }
});
```

### Como Testar a Integração g4Flex

1. **Teste via Postman ou curl**:
   ```bash
   POST http://localhost:3000/api/integrations/g4flex/work-orders/requests
   Headers:
     Content-Type: application/json
   Query Params:
     customerIdentifier: 12345678901 (CPF/CNPJ)
     uraRequestId: test-123456

   Body:
   {
     "productId": "001",
     "requesterNameAndPosition": "João Silva - Gerente",
     "incidentAndReceiverName": "Problema no equipamento - Maria Santos",
     "requesterContact": "11999887766"
   }
   ```

2. **Verificar se a notificação foi enviada**:
   - Verifique os logs do backend para confirmar que a notificação foi enviada
   - No frontend, a notificação deve aparecer automaticamente
   - Teste com o navegador aberto para ver a notificação in-app
   - Teste com o navegador fechado para ver a notificação do sistema

### Fluxo Completo de Notificações

1. **Criação da Ordem de Serviço**:
   - Requisição para `/api/integrations/g4flex/work-orders/requests`
   - Processamento pela fila `createWorkOrder`
   - Criação da OS no ERP
   - **🔔 Notificação:** "Nova Ordem de Serviço Criada"
   - Adição à fila `assignTechnician`

2. **Atribuição de Técnico**:
   - Processamento pela fila `assignTechnician`
   - Busca por técnico disponível
   - Atribuição do técnico à OS no ERP
   - **🔔 Notificação:** "Técnico Atribuído"
   - Atualização do status para `WAITING_ARRIVAL`

## Estrutura de dados

### Modelo PushSubscription

```javascript
{
  id: Integer,
  endpoint: String,         // URL do endpoint de push
  expirationTime: Date,     // Tempo de expiração (opcional)
  p256dh: String,           // Chave pública do cliente
  auth: String,             // Token de autenticação
  user_id: Integer,         // ID do usuário (opcional)
  active: Boolean,          // Se a assinatura está ativa
  created_at: Date,
  updated_at: Date
}
```

### Payload de Notificação

```javascript
{
  notification: {
    title: String,          // Título da notificação
    body: String,           // Corpo da mensagem
    icon: String,           // URL do ícone (opcional)
    tag: String,            // Tag para agrupar notificações (opcional)
    data: Object            // Dados adicionais (opcional)
  }
}
```

## Exemplo de Uso: Notificar sobre Ordens de Serviço

O sistema já está configurado para enviar notificações nos seguintes casos:

1. Quando uma nova ordem de serviço é criada
2. Quando uma ordem de serviço tem sua etapa atualizada

Estas notificações são enviadas automaticamente através do `WorkOrderController`.

## Depuração

Para verificar o funcionamento das notificações push, você pode:

1. Verificar o console do navegador para erros relacionados ao service worker
2. Verificar o console do servidor para erros relacionados ao envio de notificações
3. Verificar a lista de assinaturas no endpoint `GET /notifications/subscriptions`
4. Testar o envio manual de uma notificação usando o endpoint `POST /notifications/send`

## Compatibilidade

O sistema funciona nos seguintes navegadores:

- Chrome 50+
- Firefox 44+
- Edge 17+
- Safari 16.4+ (iOS 16.4+)
- Opera 37+

## Limitações e Considerações

- Notificações push exigem permissão explícita do usuário
- Alguns navegadores podem restringir o número de notificações enviadas
- Dispositivos móveis podem ter política de economia de bateria que atrasa notificações
- O payload das notificações é limitado (geralmente a 4KB)
