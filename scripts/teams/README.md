# Microsoft Teams Scripts

Esta pasta contém todos os scripts relacionados ao sistema de notificações do Microsoft Teams integrado ao Conab+.

## 📂 Scripts Disponíveis

### 🔧 Scripts de Configuração

#### `insert-new-teams-token.js`
**Propósito**: Inserir novo token do Teams obtido via Postman/OAuth no banco MySQL.

**Quando usar**:
- Primeira configuração do sistema
- Substituição de token expirado
- Após obter novo token via OAuth

**Como executar**:
```bash
node scripts/teams/insert-new-teams-token.js
```

**O que faz**:
- Insere/atualiza token no MySQL
- Agenda renovação automática (se disponível refresh_token)
- Verifica funcionamento do sistema
- Cancela jobs antigos de renovação

---

#### `teams-setup.js`
**Propósito**: Configuração inicial e verificação geral do sistema Teams.

**Quando usar**:
- Primeira instalação
- Verificação após mudanças no ambiente
- Diagnóstico de problemas de configuração

**Como executar**:
```bash
node scripts/teams/teams-setup.js
```

**O que verifica**:
- Variáveis de ambiente necessárias
- Conexão com banco de dados
- Configurações do BullMQ
- Estrutura de modelos

---

### 🧪 Scripts de Teste

#### `teams-test.js`
**Propósito**: Teste prático de envio de notificação Teams.

**Quando usar**:
- Verificar se notificações estão funcionando
- Teste após configuração
- Debugging de problemas de envio

**Como executar**:
```bash
node scripts/teams/teams-test.js
```

**O que faz**:
- Envia mensagem de teste para o canal Teams
- Verifica autenticação
- Testa integração completa

---

#### `check-refresh-system.js`
**Propósito**: Verificar sistema de renovação automática de tokens.

**Quando usar**:
- Verificar se renovação automática está funcionando
- Diagnosticar problemas de token expirando
- Testar refresh_token

**Como executar**:
```bash
node scripts/teams/check-refresh-system.js
```

**O que verifica**:
- Tokens no banco de dados
- Funcionalidade de renovação
- Jobs agendados no BullMQ
- Tempo restante até expiração

---

### 📊 Scripts de Monitoramento

#### `teams-status.js`
**Propósunto**: Status geral do sistema Teams.

**Quando usar**:
- Monitoramento regular
- Verificação rápida de saúde do sistema
- Antes de deploys

**Como executar**:
```bash
node scripts/teams/teams-status.js
```

**O que mostra**:
- Status de autenticação
- Informações dos tokens
- Status dos jobs
- Métricas gerais

---

#### `teams-complete.js`
**Propósito**: Verificação completa e detalhada do sistema.

**Quando usar**:
- Análise profunda de problemas
- Auditoria completa do sistema
- Debugging avançado

**Como executar**:
```bash
node scripts/teams/teams-complete.js
```

**O que faz**:
- Verificação completa de todos os componentes
- Relatório detalhado de funcionamento
- Diagnóstico avançado

---

## 🚀 Fluxo de Uso Recomendado

### Primeira Configuração:
1. `teams-setup.js` - Verificar ambiente
2. `insert-new-teams-token.js` - Inserir token
3. `teams-test.js` - Testar funcionamento

### Monitoramento Regular:
1. `teams-status.js` - Status geral
2. `check-refresh-system.js` - Verificar renovação

### Resolução de Problemas:
1. `teams-complete.js` - Diagnóstico completo
2. `check-refresh-system.js` - Verificar tokens
3. `teams-test.js` - Testar funcionamento

---

## ⚙️ Pré-requisitos

### Variáveis de Ambiente:
```env
# Microsoft Teams Configuration
TEAMS_CLIENT_ID=your_client_id
TEAMS_CLIENT_SECRET=your_client_secret
TEAMS_TENANT_ID=your_tenant_id
TEAMS_NOTIFICATION_USER_ID=work_order_bot

# Database
DB_HOST=localhost
DB_USER=your_user
DB_PASS=your_password
DB_NAME=your_database

# Redis (BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Dependências:
- MySQL em execução
- Redis em execução
- Tokens do Microsoft Teams válidos
- Permissões adequadas no Azure AD

---

## 🔄 Sistema de Renovação Automática

O sistema utiliza **BullMQ** para renovação automática dos tokens:

### Como Funciona:
1. Token inserido no MySQL com data de expiração
2. Job agendado para 10 minutos antes da expiração
3. Sistema automaticamente renova usando refresh_token
4. Novo token salvo no banco
5. Novo job agendado para próxima renovação

### Monitoramento:
- Dashboard BullMQ: `http://localhost:3003`
- Logs do sistema
- Scripts de verificação

---

## 🛠️ Comandos NPM Sugeridos

Adicione ao `package.json`:

```json
{
  "scripts": {
    "teams:setup": "node scripts/teams/teams-setup.js",
    "teams:test": "node scripts/teams/teams-test.js",
    "teams:status": "node scripts/teams/teams-status.js",
    "teams:check": "node scripts/teams/check-refresh-system.js",
    "teams:complete": "node scripts/teams/teams-complete.js",
    "teams:insert": "node scripts/teams/insert-new-teams-token.js"
  }
}
```

---

## 📝 Logs e Debugging

### Arquivos de Log:
- Console output de cada script
- Logs do BullMQ
- Logs do sistema principal

### Debugging:
1. Verificar variáveis de ambiente
2. Confirmar conexões (MySQL, Redis)
3. Validar tokens no banco
4. Testar refresh_token
5. Verificar jobs no BullMQ

---

## 🔐 Segurança

### Tokens:
- Nunca commit tokens reais no código
- Use variáveis de ambiente
- Rotacione tokens regularmente
- Monitore expiração

### Permissões:
- Mínimas necessárias no Azure AD
- Scopes específicos por funcionalidade
- Revisão regular de permissões

---

## 💡 Sugestões de Melhorias

1. **Script de Deploy**: Automatizar deploy de tokens em produção
2. **Script de Backup**: Backup dos tokens antes de renovações
3. **Monitoramento Avançado**: Métricas e alertas
4. **Interface Web**: Dashboard web para gerenciamento
5. **Testes Automatizados**: Suite de testes para CI/CD

---

## 📞 Suporte

Em caso de problemas:
1. Execute `teams-complete.js` para diagnóstico
2. Verifique logs do sistema
3. Confirme configurações de ambiente
4. Teste conectividades necessárias

**Commit**: `docs: add comprehensive Teams scripts README`
