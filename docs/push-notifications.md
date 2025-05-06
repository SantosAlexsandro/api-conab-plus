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
