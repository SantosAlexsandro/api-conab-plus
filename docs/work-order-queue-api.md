# Work Order Queue API

API para controle de edição de ordens de trabalho na fila de espera.

## Autenticação

🔒 **Todas as rotas requerem autenticação JWT**

```bash
Authorization: Bearer <jwt_token>
```

O `userId` é extraído automaticamente do token JWT, garantindo segurança.

## Endpoints

### 1. Pausar Atribuição de Técnico

**POST** `/work-order-queue/:orderNumber/pause-technician-assignment`

Pausa o processamento automático de uma ordem específica para permitir edição manual.

#### Headers
```bash
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Query Parameters
- `uraRequestId` (opcional): ID da requisição URA para logs

#### Response Success (200)
```json
{
  "success": true,
  "orderNumber": "123456",
  "status": "WAITING_TECHNICIAN",
  "isEditing": true,
  "message": "Technician assignment paused for order 123456. Workers will skip this order.",
  "pausedBy": "user123"
}
```

#### Response Error (404)
```json
{
  "error": "Order not found in waiting queue"
}
```

#### Response Error (400)
```json
{
  "error": "Order is not waiting for technician assignment. Current status: IN_PROGRESS",
  "currentStatus": "IN_PROGRESS"
}
```

#### Response Error (409)
```json
{
  "error": "Order is already being edited",
  "isEditing": true
}
```

### 2. Retomar Atribuição de Técnico

**POST** `/work-order-queue/:orderNumber/resume-technician-assignment`

Retoma o processamento automático de uma ordem após edição manual.

#### Headers
```bash
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Query Parameters
- `uraRequestId` (opcional): ID da requisição URA para logs

#### Response Success (200)
```json
{
  "success": true,
  "orderNumber": "123456",
  "status": "WAITING_TECHNICIAN",
  "isEditing": false,
  "message": "Technician assignment resumed for order 123456. Workers will process this order normally.",
  "resumedBy": "user123"
}
```

#### Response Error (400)
```json
{
  "error": "Order is not currently being edited",
  "isEditing": false
}
```

## Recursos de Segurança

### 1. Autenticação JWT
- UserID extraído do token, não do frontend
- Impossível falsificar identidade do usuário
- Middleware `authUser` garante usuário válido

### 2. TTL (Time To Live)
- Edições expiram automaticamente em **10 minutos**
- Previne ordens "travadas" indefinidamente
- Sistema se recupera automaticamente

### 3. Race Condition Protection
- Múltiplas verificações no worker
- Verificação antes do processamento
- Verificação durante processamento
- Fallback para ordem mais antiga não editando

## Fluxo de Uso

1. **Frontend autentica usuário** → JWT token
2. **Usuário clica "Editar Ordem"** → POST pause
3. **Sistema pausa processamento** → `isEditing = true`
4. **Usuário edita dados** → Interface liberada
5. **Usuário salva/cancela** → POST resume
6. **Sistema retoma processamento** → `isEditing = false`

### Auto-Recuperação TTL

Se usuário abandonar a tela:
- Após 10 minutos, flag `isEditing` é automaticamente desativada
- Worker retoma processamento normal
- Sistema continua funcionando

## Logs e Monitoramento

Todas as ações são logadas com:
- `uraRequestId`: Rastreabilidade
- `userId`: Quem executou a ação
- `orderNumber`: Ordem afetada
- `timestamp`: Quando ocorreu
- `action`: Tipo de ação (pause/resume)

## Códigos de Status

- **200**: Sucesso
- **400**: Dados inválidos ou estado inconsistente
- **401**: Não autenticado
- **404**: Ordem não encontrada
- **409**: Conflito (já editando)
- **500**: Erro interno do servidor
