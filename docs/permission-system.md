# Sistema de Permissões e Perfis

O sistema de permissões e perfis da API ConabPlus foi implementado para proporcionar controle de acesso granular às funcionalidades do sistema. Este documento descreve a arquitetura, estrutura de banco de dados, componentes e instruções de uso do sistema.

## Índice

- [Visão Geral](#visão-geral)
- [Estrutura de Banco de Dados](#estrutura-de-banco-de-dados)
- [Modelos](#modelos)
- [Middlewares](#middlewares)
- [Serviços](#serviços)
- [Controladores e Rotas](#controladores-e-rotas)
- [Utilização](#utilização)
- [Seeders](#seeders)
- [Boas Práticas](#boas-práticas)
- [Resolução de Problemas](#resolução-de-problemas)

## Visão Geral

O sistema de permissões e perfis utiliza uma abordagem baseada em RBAC (Role-Based Access Control), onde:

- **Usuários**: são definidos por seus nomes de usuário na tabela `user_sessions`
- **Perfis (Roles)**: agrupamentos lógicos de permissões (ex: Administrador, Técnico, etc.)
- **Permissões**: representam ações específicas que podem ser realizadas no sistema
- **Relacionamentos**: associações muitos-para-muitos entre usuários, perfis e permissões

O fluxo de controle de acesso é:
1. O usuário faz login e recebe um token JWT
2. Ao acessar recursos protegidos, o middleware de autenticação valida o token
3. O middleware de autorização verifica se o usuário tem a permissão necessária
4. O acesso é concedido ou negado com base nessa verificação

## Estrutura de Banco de Dados

O sistema utiliza cinco tabelas principais:

### Tabela `user_sessions`
Armazena informações sobre sessões de usuário:
- `id`: ID único
- `user_name`: Nome de usuário (índice único)
- `encrypted_password`: Senha criptografada
- `session_token`: Token de sessão
- `session_expiration`: Data de expiração da sessão

### Tabela `roles`
Armazena os perfis de usuário:
- `id`: ID único do perfil
- `name`: Nome do perfil (único)
- `description`: Descrição do perfil
- `is_active`: Status de ativação do perfil

### Tabela `permissions`
Armazena as permissões disponíveis:
- `id`: ID único da permissão
- `name`: Nome da permissão (único)
- `slug`: Identificador único usado na verificação (ex: "users.create")
- `description`: Descrição da permissão
- `module`: Módulo ao qual a permissão pertence
- `is_active`: Status de ativação da permissão

### Tabela `role_permissions`
Tabela de relacionamento entre perfis e permissões:
- `id`: ID único
- `role_id`: ID do perfil (chave estrangeira)
- `permission_id`: ID da permissão (chave estrangeira)

### Tabela `user_roles`
Tabela de relacionamento entre usuários e perfis:
- `id`: ID único
- `user_name`: Nome do usuário (chave estrangeira)
- `role_id`: ID do perfil (chave estrangeira)

## Modelos

### Role.js
```javascript
// Modelo de Perfil
export default class Role extends Model {
  static init(sequelize) {
    super.init({
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
      }
    }, { sequelize, tableName: 'roles' });
    return this;
  }

  static associate(models) {
    this.belongsToMany(models.Permission, {
      foreignKey: 'role_id',
      through: 'role_permissions',
      as: 'permissions'
    });

    this.belongsToMany(models.UserSession, {
      foreignKey: 'role_id',
      otherKey: 'user_name',
      through: 'user_roles',
      as: 'users',
      targetKey: 'userName'
    });
  }
}
```

### Permission.js
```javascript
// Modelo de Permissão
export default class Permission extends Model {
  static init(sequelize) {
    super.init({
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      module: { type: Sequelize.STRING, allowNull: false },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
      }
    }, { sequelize, tableName: 'permissions' });
    return this;
  }

  static associate(models) {
    this.belongsToMany(models.Role, {
      foreignKey: 'permission_id',
      through: 'role_permissions',
      as: 'roles'
    });
  }
}
```

### UserSession.js
```javascript
// Modelo de Sessão de Usuário
export default class UserSession extends Model {
  static init(sequelize) {
    super.init(
      {
        userName: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'user_name',
          primaryKey: true // Importante: definido como chave primária para associações
        },
        encryptedPassword: {
          type: Sequelize.TEXT,
          allowNull: false,
          field: 'encrypted_password',
        },
        sessionToken: {
          type: Sequelize.TEXT,
          allowNull: false,
          field: 'session_token',
        },
        sessionExpiration: {
          type: Sequelize.DATE,
          allowNull: false,
          field: 'session_expiration',
        }
      },
      {
        sequelize,
        tableName: 'user_sessions',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsToMany(models.Role, {
      foreignKey: 'user_name',
      otherKey: 'role_id',
      through: 'user_roles',
      as: 'roles',
      sourceKey: 'userName' // Especifica que a chave fonte é userName
    });
  }
}
```

## Middlewares

### checkPermission.js
Este middleware verifica se o usuário possui a permissão necessária para acessar determinada rota:

```javascript
export default function checkPermission(requiredPermissions) {
  return async (req, res, next) => {
    try {
      // Verifica se o usuário existe
      if (!req.userName) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      // Converte o parâmetro para array
      const permissionsToCheck = Array.isArray(requiredPermissions)
        ? requiredPermissions : [requiredPermissions];

      // Busca o usuário com suas roles e permissões
      const user = await UserSession.findOne({
        where: { userName: req.userName },
        include: {
          association: 'roles',
          include: {
            association: 'permissions',
            where: {
              slug: { [Op.in]: permissionsToCheck },
              isActive: true
            },
            required: false
          },
          required: false
        }
      });

      // Verifica se o usuário possui permissão
      const userPermissions = user.roles.flatMap(
        role => role.permissions.map(permission => permission.slug)
      );

      const hasPermission = permissionsToCheck.some(
        permission => userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          message: "Você não tem permissão para acessar este recurso"
        });
      }

      next();
    } catch (error) {
      console.error("Erro ao verificar permissões:", error);
      return res.status(500).json({
        message: "Erro ao verificar permissões",
        error: error.message
      });
    }
  };
}
```

## Serviços

### RolePermissionService.js

O serviço `RolePermissionService` fornece métodos para gerenciar perfis e permissões:

- Gerenciamento de perfis:
  - `createRole(data)`: Cria um novo perfil
  - `updateRole(id, data)`: Atualiza um perfil existente
  - `deleteRole(id)`: Remove um perfil
  - `getRoles(options)`: Lista perfis com paginação e filtros
  - `getRoleById(id)`: Busca um perfil pelo ID com suas permissões

- Gerenciamento de permissões:
  - `createPermission(data)`: Cria uma nova permissão
  - `getPermissions(options)`: Lista permissões com paginação e filtros

- Gerenciamento de associações:
  - `assignPermissionsToRole(roleId, permissionIds)`: Associa permissões a um perfil
  - `removePermissionFromRole(roleId, permissionId)`: Remove uma permissão de um perfil
  - `assignRoleToUser(userName, roleId)`: Associa um perfil a um usuário
  - `removeRoleFromUser(userName, roleId)`: Remove um perfil de um usuário
  - `getUserRoles(userName)`: Obtém os perfis de um usuário

## Controladores e Rotas

### Controladores
O sistema possui três controladores principais:

1. **RoleController**: Gerencia operações CRUD para perfis
2. **PermissionController**: Gerencia permissões do sistema
3. **UserRoleController**: Gerencia a atribuição de perfis aos usuários

### Rotas

#### Rotas de Perfis (`/roles`)
- `GET /roles`: Lista perfis
- `GET /roles/:id`: Obtém um perfil específico
- `POST /roles`: Cria um novo perfil
- `PUT /roles/:id`: Atualiza um perfil
- `DELETE /roles/:id`: Remove um perfil
- `POST /roles/:id/permissions`: Atribui permissões a um perfil
- `DELETE /roles/:roleId/permissions/:permissionId`: Remove uma permissão de um perfil

#### Rotas de Permissões (`/permissions`)
- `GET /permissions`: Lista permissões
- `POST /permissions`: Cria uma nova permissão

#### Rotas de Usuários e Perfis (`/users`)
- `GET /users/:userName/roles`: Lista perfis de um usuário
- `POST /users/:userName/roles`: Atribui um perfil a um usuário
- `DELETE /users/:userName/roles/:roleId`: Remove um perfil de um usuário

## Utilização

### Protegendo Rotas

Para proteger uma rota com uma verificação de permissão:

```javascript
// Rota protegida por autenticação e permissão
router.get('/endpoint',
  authUser, // Middleware de autenticação
  checkPermission('module.action'), // Middleware de verificação de permissão
  controllerMethod // Método do controlador
);
```

### Verificando Múltiplas Permissões

Para verificar se o usuário possui pelo menos uma das permissões listadas:

```javascript
router.get('/endpoint',
  authUser,
  checkPermission(['module.action1', 'module.action2']),
  controllerMethod
);
```

## Seeders

O sistema inclui um seeder para adicionar permissões iniciais e um perfil de administrador:

```javascript
// 20250801100000-default-permissions-fixed.js
'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // Lista de permissões iniciais
    const permissions = [
      {
        name: 'Visualizar Perfis',
        slug: 'roles.view',
        description: 'Permite visualizar a lista de perfis',
        module: 'roles',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      // ... outras permissões
    ];

    try {
      // Inserir as permissões
      await queryInterface.bulkInsert('permissions', permissions);

      // Criar um perfil de administrador
      await queryInterface.bulkInsert('roles', [{
        name: 'Administrador',
        description: 'Perfil com acesso total ao sistema',
        is_active: true,
        created_at: now,
        updated_at: now,
      }]);

      // Associar permissões ao perfil
      // ... código para associar permissões
    } catch (error) {
      console.error('Erro no seeder:', error);
    }
  },

  async down(queryInterface) {
    // ... código para reverter as alterações
  }
};
```

### Script de Configuração

O arquivo `scripts/setup-permissions.js` automatiza o processo de configuração:

```javascript
// Executa migrações e seeders na ordem correta
async function setupPermissions() {
  // 1. Adicionar índice único ao user_name
  await runCommand('npx sequelize-cli db:migrate --name 20250801000000-add-unique-index-user-sessions.js');

  // 2. Criar tabela de roles
  await runCommand('npx sequelize-cli db:migrate --name 20250801000001-create-roles.js');

  // ... outras migrações

  // 6. Executar o seeder
  await runCommand('npx sequelize-cli db:seed --seed 20250801100000-default-permissions-fixed.js');
}
```

## Boas Práticas

1. **Nomes de Permissões**: Use o padrão `módulo.ação` para os slugs de permissão (ex: "users.create")
2. **Permissões Granulares**: Defina permissões para cada operação específica
3. **Perfis Sensatos**: Crie perfis que agrupem permissões por responsabilidade
4. **Sempre Verificar Permissões**: Não confie apenas na interface para esconder opções
5. **Logging**: Registre tentativas falhas de acesso para fins de segurança

## Resolução de Problemas

### Problemas Comuns e Soluções

1. **Erro: Foreign key constraint is incorrectly formed**
   - Solução: Garantir que a coluna `user_name` em `user_sessions` tenha um índice único

2. **Erro: Invalid or unexpected token em seeders**
   - Solução: Uso do 'use strict' e tratamento correto de callbacks em seeders

3. **Permissões não funcionam com MariaDB**
   - Solução: Não usar `{ returning: true }` com MariaDB, em vez disso, fazer consultas separadas para obter os IDs inseridos

4. **Erro ao buscar usuário com suas permissões**
   - Solução: Garantir que o campo `userName` em UserSession seja definido como `primaryKey: true` e especificar corretamente as chaves `sourceKey` e `targetKey` nas associações entre UserSession e Role

### Compatibilidade com Bancos de Dados

O sistema foi testado com MariaDB e inclui adaptações específicas para esse banco de dados, como evitar o uso de `returning: true` nas operações de inserção.
