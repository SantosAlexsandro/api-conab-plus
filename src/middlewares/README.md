# Sistema de Autenticação

## Visão Geral

O sistema de autenticação foi projetado para suportar múltiplos tipos de autenticação:

1. **Autenticação de Usuários** - Para usuários da aplicação web/mobile
2. **Autenticação de Integrações** - Para sistemas externos que se integram com nossa API
   - G4Flex
   - ERP (futuro)
   - Outras integrações (futuro)

## Estrutura de Middlewares

### `authUser.js`
Middleware específico para autenticar usuários normais do sistema. Verifica:
- Token JWT válido
- Tipo de token 'user'
- Sessão válida no banco
- Renovação automática de tokens ERP

## Arquitetura por Domínio

O sistema está organizado de acordo com o Domain-Driven Design (DDD):

### Estrutura de Diretórios
```
src/
├── controllers/
│   └── TokenController.js         # Autenticação de usuários regulares
│
├── integrations/
│   └── g4flex/
│       ├── controllers/
│       │   └── TokenController.js  # Autenticação específica G4Flex
│       ├── middlewares/
│       │   └── authG4Flex.js       # Middleware específico G4Flex
│       ├── routes/
│       │   └── tokenRoutes.js      # Rotas de autenticação G4Flex
│       └── services/
│           └── TokenService.js     # Lógica de token G4Flex
│
└── middlewares/
    └── authUser.js               # Middleware para usuários regulares
```

## Como Usar

Nas rotas, importe o middleware adequado para o tipo de recurso:

```javascript
// Para rotas de usuário normal
import authUser from '../middlewares/authUser';
router.post('/recurso', authUser, controller.metodo);

// Para rotas específicas do G4Flex
import authG4Flex from '../middlewares/authG4Flex'; // Se usado fora do domínio G4Flex
// OU
import authG4Flex from './middlewares/authG4Flex'; // Se usado dentro do domínio G4Flex
router.get('/recurso', authG4Flex, controller.metodo);
```

## Endpoints de Autenticação

1. **Usuários** (`/token`):
   - Fornece usuário/senha
   - Recebe token JWT com `type: 'user'`

2. **G4Flex** (`/api/integrations/g4flex/token`):
   - Fornece apiKey/clientId
   - Recebe token JWT com `type: 'integration', integration: 'g4flex'`

3. **Estrutura para futuras integrações**:
   - `/api/integrations/erp/token`
   - `/api/integrations/hubspot/token`

## Princípios de Design

1. **Completa separação por domínio**: Cada integração tem:
   - Seu próprio middleware de autenticação
   - Seu próprio controlador de autenticação
   - Suas próprias rotas
   - Seus próprios serviços

2. **Organização modular**: Módulos independentes e coesos

3. **Princípio de responsabilidade única**: Cada componente tem uma única função

## Segurança

- Todos os tokens expiram conforme configurado no `.env`
- Usuários têm autenticação em duas camadas (JWT + sessão)
- Integrações têm controle granular por clientId
