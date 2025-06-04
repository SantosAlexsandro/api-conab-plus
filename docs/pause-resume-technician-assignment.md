# Sistema de Pause/Resume para Atribuição de Técnicos

## 📋 **Visão Geral**

Sistema que permite pausar temporariamente a atribuição automática de técnicos para ordens de serviço, permitindo atribuição manual sem conflitos com o sistema automatizado.

### **🎯 Características Principais:**
- **Pausa Global:** Quando uma ordem está sendo editada, TODAS as ordens com status `WAITING_TECHNICIAN` são pausadas
- **TTL Automático:** Liberação automática após 10 minutos se o usuário abandonar a sessão
- **Proteção Anti-Abandono:** Sistema se recupera automaticamente de sessões perdidas
- **Logs Detalhados:** Rastreamento completo de quem pausou, quando e por quanto tempo

---

## 🔧 **Endpoints Disponíveis**

### **1. Pausar Atribuição**
```http
PUT /work-order-queue/{orderNumber}/pause-technician-assignment
```

**Parâmetros:**
- `orderNumber` (path): Número da ordem de serviço
- `uraRequestId` (query, opcional): ID da requisição URA

**Headers:**
- `Authorization`: Token de autenticação (usuário logado)

**Exemplo:**
```bash
curl -X PUT "http://localhost:3000/work-order-queue/1555738/pause-technician-assignment?uraRequestId=abc123" \
  -H "Authorization: Bearer {token}"
```

**Resposta (200):**
```json
{
  "success": true,
  "orderNumber": "1555738",
  "status": "WAITING_TECHNICIAN",
  "isEditing": true,
  "message": "Technician assignment paused for order 1555738. Workers will skip this order.",
  "pausedBy": "alexsandro.santos"
}
```

### **2. Retomar Atribuição**
```http
PUT /work-order-queue/{orderNumber}/resume-technician-assignment
```

**Parâmetros:**
- `orderNumber` (path): Número da ordem de serviço
- `uraRequestId` (query, opcional): ID da requisição URA

**Exemplo:**
```bash
curl -X PUT "http://localhost:3000/work-order-queue/1555738/resume-technician-assignment" \
  -H "Authorization: Bearer {token}"
```

**Resposta (200):**
```json
{
  "success": true,
  "orderNumber": "1555738",
  "status": "WAITING_TECHNICIAN",
  "isEditing": false,
  "message": "Technician assignment resumed for order 1555738. Workers will process this order normally.",
  "resumedBy": "alexsandro.santos"
}
```

---

## 🔄 **Comportamento do Sistema**

### **📊 Pausa Global**
Quando **QUALQUER** ordem é pausada:
- ✅ **TODAS** as ordens com status `WAITING_TECHNICIAN` param de receber técnicos automaticamente
- ✅ Workers detectam edição ativa e reagendam processamento para 1 minuto depois
- ✅ Sistema mantém tentativas até que não haja mais edições ativas

### **⏰ TTL (Time To Live)**
- **Duração:** 10 minutos por sessão de edição
- **Verificação:** A cada tentativa do worker (1 minuto)
- **Liberação:** Automática quando TTL expira

### **🔄 Reagendamento Inteligente**
```
00:00 - PAUSE ativado (isEditing=true)
00:01 - Worker detecta → Reagenda para 01:01
01:01 - Worker detecta novamente → Reagenda para 02:01
...
10:00 - TTL expira → isEditing=false automaticamente
10:01 - Worker processa normalmente
```

---

## ⚠️ **Validações e Erros**

### **Validações do PAUSE:**
- ✅ Ordem deve existir na fila de espera
- ✅ Status deve ser `WAITING_TECHNICIAN`
- ✅ Ordem não pode já estar sendo editada
- ✅ Usuário deve estar autenticado

### **Códigos de Erro:**

**400 - Bad Request:**
```json
{
  "error": "Order is not waiting for technician assignment. Current status: IN_PROGRESS",
  "currentStatus": "IN_PROGRESS"
}
```

**404 - Not Found:**
```json
{
  "error": "Order not found in waiting queue"
}
```

**409 - Conflict:**
```json
{
  "error": "Order is already being edited",
  "isEditing": true
}
```

---

## 📊 **Monitoramento e Logs**

### **Logs do Worker:**
```
🔒 PAUSA GLOBAL: Ordem 1555738 está sendo editada por alexsandro.santos
⏸️ Reagendando TODAS as ordens com status WAITING_TECHNICIAN...
📅 Ordem 1555739 reagendada para 16:35:00 - pausa global (1555738 em edição)
```

### **Logs de TTL:**
```
⏰ Edição da ordem 1555738 expirada (TTL: 10min)
📊 Editada há 612s por usuário: alexsandro.santos
🔧 Liberando ordem automaticamente...
```

### **Logs de Sistema:**
```
✅ Nenhuma edição ativa detectada - processamento pode continuar
```

---

## 🗃️ **Estrutura de Banco de Dados**

### **Tabela: `work_order_waiting_queue`**
```sql
-- Campos relacionados ao pause/resume
is_editing      BOOLEAN DEFAULT false  -- Se está sendo editada
edited_at       DATETIME               -- Quando foi pausada
edited_by       VARCHAR(255)           -- Quem pausou
```

### **Status de Ordem:**
- `WAITING_TECHNICIAN`: Aguardando atribuição de técnico (pode ser pausada)
- `WAITING_ARRIVAL`: Técnico já atribuído (não afetada pelo pause)
- `IN_PROGRESS`: Em execução (não afetada pelo pause)

---

## 🔧 **Configurações**

### **TTL de Edição:**
```javascript
// src/services/WorkOrderWaitingQueueService.js
const maxEditDurationMs = 10 * 60 * 1000; // 10 minutos
```

### **Intervalo de Reagendamento:**
```javascript
// src/integrations/g4flex/queues/workOrder.worker.js
const RETRY_INTERVAL_MS = 1 * 60 * 1000; // 1 minuto
```

---

## 🚀 **Casos de Uso**

### **1. Atribuição Manual de Técnico:**
```
1. Operador acessa ordem 1555738
2. PUT /pause-technician-assignment
3. Sistema pausa TODAS as atribuições automáticas
4. Operador escolhe técnico manualmente
5. PUT /resume-technician-assignment
6. Sistema retoma atribuições automáticas
```

### **2. Sessão Abandonada:**
```
1. Operador pausa ordem 1555738
2. Operador fecha navegador sem fazer resume
3. Após 10 minutos → TTL expira automaticamente
4. Sistema retoma atribuições normalmente
```

### **3. Múltiplas Ordens:**
```
1. Ordem 1555738 pausada
2. Ordens 1555739, 1555740, 1555741 → TODAS param automaticamente
3. Resume na 1555738 → TODAS voltam ao normal
```

---

## 🔍 **Troubleshooting**

### **Problema: Ordens não recebem técnicos**
**Verificar:**
1. Se há alguma ordem com `is_editing = true`
2. Logs do worker para verificar pausa global
3. TTL de edições antigas

**Solução:**
```sql
-- Verificar ordens em edição
SELECT order_number, edited_by, edited_at, is_editing 
FROM work_order_waiting_queue 
WHERE is_editing = true;

-- Forçar liberação se necessário
UPDATE work_order_waiting_queue 
SET is_editing = false, edited_at = null, edited_by = null 
WHERE order_number = '1555738';
```

### **Problema: TTL não está funcionando**
**Verificar:**
1. Worker está rodando
2. Função `isOrderEditingExpired` sendo chamada
3. Diferença de timezone entre banco e aplicação

---

## 📝 **Notas de Desenvolvimento**

### **Arquivos Principais:**
- `src/controllers/WorkOrderWaitingQueueController.js` - Endpoints
- `src/services/WorkOrderWaitingQueueService.js` - Lógica de negócio
- `src/integrations/g4flex/queues/workOrder.worker.js` - Worker BullMQ
- `src/models/workOrderWaitingQueue.js` - Model Sequelize

### **Dependências:**
- BullMQ para filas
- Sequelize para banco de dados
- Sistema de autenticação para rastreamento de usuário

### **Considerações de Performance:**
- Verificação global executa 1 query por tentativa do worker
- TTL verification é automática e eficiente
- Reagendamento não sobrecarrega o Redis (removeOnComplete: false)

---

## 🔄 **Migration**

Para adicionar o campo `edited_by`:
```bash
npm run migration
```

**Arquivo:** `20241215120000-add-edited-by-to-work-order-waiting-queue.js` 