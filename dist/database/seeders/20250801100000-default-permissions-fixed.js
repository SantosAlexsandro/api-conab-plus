"use strict";'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // Lista de permissões iniciais
    const permissions = [
      // Permissões de Perfis
      {
        name: 'Visualizar Perfis',
        slug: 'roles.view',
        description: 'Permite visualizar a lista de perfis',
        module: 'roles',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Criar Perfis',
        slug: 'roles.create',
        description: 'Permite criar novos perfis',
        module: 'roles',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Editar Perfis',
        slug: 'roles.edit',
        description: 'Permite editar perfis existentes',
        module: 'roles',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Excluir Perfis',
        slug: 'roles.delete',
        description: 'Permite excluir perfis',
        module: 'roles',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Atribuir Permissões',
        slug: 'roles.assign_permissions',
        description: 'Permite atribuir ou remover permissões de um perfil',
        module: 'roles',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      // Permissões de Permissões
      {
        name: 'Visualizar Permissões',
        slug: 'permissions.view',
        description: 'Permite visualizar a lista de permissões',
        module: 'permissions',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Criar Permissões',
        slug: 'permissions.create',
        description: 'Permite criar novas permissões',
        module: 'permissions',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      // Permissões de Usuários
      {
        name: 'Visualizar Perfis de Usuários',
        slug: 'users.view_roles',
        description: 'Permite visualizar os perfis atribuídos a um usuário',
        module: 'users',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Atribuir Perfis a Usuários',
        slug: 'users.assign_roles',
        description: 'Permite atribuir ou remover perfis de um usuário',
        module: 'users',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
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

      // Buscar o perfil de administrador
      const [adminRoles] = await queryInterface.sequelize.query(
        "SELECT id FROM roles WHERE name = 'Administrador'"
      );

      const adminRole = adminRoles[0];

      // Buscar todas as permissões inseridas
      const [insertedPermissions] = await queryInterface.sequelize.query(
        'SELECT id FROM permissions'
      );

      // Associar todas as permissões ao perfil de administrador
      if (adminRole && insertedPermissions.length > 0) {
        const rolePermissions = insertedPermissions.map(permission => ({
          role_id: adminRole.id,
          permission_id: permission.id,
          created_at: now,
          updated_at: now,
        }));

        await queryInterface.bulkInsert('role_permissions', rolePermissions);
      }
    } catch (error) {
      console.error('Erro no seeder:', error);
    }
  },

  async down(queryInterface) {
    try {
      // Remover as associações
      await queryInterface.bulkDelete('role_permissions', null, {});

      // Remover o perfil de administrador
      await queryInterface.bulkDelete('roles', { name: 'Administrador' }, {});

      // Remover todas as permissões
      await queryInterface.bulkDelete('permissions', null, {});
    } catch (error) {
      console.error('Erro ao desfazer seeder:', error);
    }
  }
};
