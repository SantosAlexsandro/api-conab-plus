"use strict";'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // Lista de permissões para a fila de ordens de serviço
    const permissions = [
      // Permissões de visualização
      {
        name: 'Visualizar Fila de Espera',
        slug: 'workorder_queue.view',
        description: 'Permite visualizar a lista de ordens na fila de espera',
        module: 'workorder_queue',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Visualizar Detalhes de Ordem na Fila',
        slug: 'workorder_queue.view_details',
        description: 'Permite visualizar detalhes de uma ordem específica na fila de espera',
        module: 'workorder_queue',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Visualizar Opções de Status da Fila',
        slug: 'workorder_queue.view_options',
        description: 'Permite visualizar as opções de status disponíveis para ordens na fila de espera',
        module: 'workorder_queue',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      // Permissões de manipulação
      {
        name: 'Atualizar Status na Fila de Espera',
        slug: 'workorder_queue.update_status',
        description: 'Permite atualizar o status de uma ordem na fila de espera',
        module: 'workorder_queue',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Atribuir Ordem da Fila a Técnico',
        slug: 'workorder_queue.assign',
        description: 'Permite atribuir uma ordem da fila de espera a um técnico',
        module: 'workorder_queue',
        is_active: true,
        created_at: now,
        updated_at: now,
      }
    ];

    try {
      // Inserir as permissões
      await queryInterface.bulkInsert('permissions', permissions);

      // Buscar o perfil de administrador
      const [adminRoles] = await queryInterface.sequelize.query(
        "SELECT id FROM roles WHERE name = 'Administrador'"
      );

      if (adminRoles && adminRoles.length > 0) {
        const adminRole = adminRoles[0];

        // Buscar as permissões inseridas
        const [workOrderQueuePermissions] = await queryInterface.sequelize.query(
          "SELECT id FROM permissions WHERE module = 'workorder_queue'"
        );

        // Associar permissões ao perfil de administrador
        if (workOrderQueuePermissions.length > 0) {
          const rolePermissions = workOrderQueuePermissions.map(permission => ({
            role_id: adminRole.id,
            permission_id: permission.id,
            created_at: now,
            updated_at: now,
          }));

          await queryInterface.bulkInsert('role_permissions', rolePermissions);
        }
      }

      console.log('Permissões da fila de ordens de serviço adicionadas com sucesso');
    } catch (error) {
      console.error('Erro ao adicionar permissões da fila de ordens de serviço:', error);
    }
  },

  async down(queryInterface) {
    try {
      // Buscar as permissões da fila de ordens de serviço
      const [workOrderQueuePermissions] = await queryInterface.sequelize.query(
        "SELECT id FROM permissions WHERE module = 'workorder_queue'"
      );

      // Remover as associações de perfis
      if (workOrderQueuePermissions && workOrderQueuePermissions.length > 0) {
        const permissionIds = workOrderQueuePermissions.map(p => p.id);
        await queryInterface.sequelize.query(
          `DELETE FROM role_permissions WHERE permission_id IN (${permissionIds.join(',')})`
        );
      }

      // Remover as permissões
      await queryInterface.bulkDelete('permissions', { module: 'workorder_queue' }, {});

      console.log('Permissões da fila de ordens de serviço removidas com sucesso');
    } catch (error) {
      console.error('Erro ao remover permissões da fila de ordens de serviço:', error);
    }
  }
};
