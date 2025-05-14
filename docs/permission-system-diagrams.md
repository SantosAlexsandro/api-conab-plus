# Diagramas do Sistema de Permissões

Este documento contém diagramas que ilustram o funcionamento do sistema de permissões e perfis do ConabPlus.

## Modelo de Dados

```mermaid
erDiagram
    USER_SESSIONS ||--o{ USER_ROLES : has
    ROLES ||--o{ USER_ROLES : belongs_to
    ROLES ||--o{ ROLE_PERMISSIONS : has
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : belongs_to

    USER_SESSIONS {
        int id PK
        string user_name PK "Chave primária adicional"
        text encrypted_password
        text session_token
        datetime session_expiration
        datetime created_at
        datetime updated_at
    }

    ROLES {
        int id PK
        string name UK
        text description
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    PERMISSIONS {
        int id PK
        string name UK
        string slug UK
        text description
        string module
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    USER_ROLES {
        int id PK
        string user_name FK
        int role_id FK
        datetime created_at
        datetime updated_at
    }

    ROLE_PERMISSIONS {
        int id PK
        int role_id FK
        int permission_id FK
        datetime created_at
        datetime updated_at
    }
```

## Fluxo de Autorização

```mermaid
sequenceDiagram
    actor User
    participant API
    participant AuthMiddleware
    participant PermissionMiddleware
    participant Service
    participant Database

    User->>API: Requisição com Token JWT
    API->>AuthMiddleware: Verificar Autenticação
    AuthMiddleware->>Database: Validar Token
    Database-->>AuthMiddleware: Token Válido
    AuthMiddleware->>API: Requisição Autenticada
    API->>PermissionMiddleware: Verificar Autorização
    PermissionMiddleware->>Database: Buscar Perfis e Permissões
    Database-->>PermissionMiddleware: Informações do Usuário
    PermissionMiddleware->>PermissionMiddleware: Verificar Permissões Necessárias
    alt Possui Permissão
        PermissionMiddleware->>Service: Permitir Acesso
        Service->>API: Processar Requisição
        API-->>User: Resposta
    else Não Possui Permissão
        PermissionMiddleware-->>User: Erro 403 - Acesso Negado
    end
```

## Arquitetura de Camadas

```mermaid
flowchart TD
    Client[Cliente] --> Routes[Rotas]
    Routes --> AuthMiddleware[Middleware de Autenticação]
    AuthMiddleware --> PermissionMiddleware[Middleware de Permissão]
    PermissionMiddleware --> Controller[Controladores]
    Controller --> Service[Serviços]
    Service --> Models[Modelos]
    Models --> Database[(Banco de Dados)]

    subgraph "Camada de Apresentação"
        Routes
    end

    subgraph "Camada de Segurança"
        AuthMiddleware
        PermissionMiddleware
    end

    subgraph "Camada de Aplicação"
        Controller
        Service
    end

    subgraph "Camada de Dados"
        Models
        Database
    end
```

## Árvore do Sistema de Permissões

```mermaid
graph TD
    A[Sistema de Permissões] --> B[Modelos]
    A --> C[Middlewares]
    A --> D[Serviços]
    A --> E[Controladores]
    A --> F[Rotas]

    B --> B1[Role.js]
    B --> B2[Permission.js]
    B --> B3[RolePermission.js]
    B --> B4[UserRole.js]

    C --> C1[checkPermission.js]

    D --> D1[RolePermissionService.js]

    E --> E1[RoleController.js]
    E --> E2[PermissionController.js]
    E --> E3[UserRoleController.js]

    F --> F1[roleRoutes.js]
    F --> F2[permissionRoutes.js]
    F --> F3[userRoleRoutes.js]
```
