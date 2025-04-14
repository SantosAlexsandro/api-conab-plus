"use strict";module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verificar se a coluna technician_id existe antes de tentar renomeá-la
    const tableDescription = await queryInterface.describeTable('work_shifts');

    if (tableDescription.technician_id) {
      // Primeiro, vamos renomear a coluna technician_id para user_code
      await queryInterface.renameColumn('work_shifts', 'technician_id', 'user_code');
    }

    // Primeiro, alteramos o tipo do ENUM
    await queryInterface.changeColumn('work_shifts', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // Depois, atualizamos os valores
    await queryInterface.sequelize.query(`
      UPDATE work_shifts
      SET status = CASE
        WHEN status = 'Ativo' THEN 'ACTIVE'
        WHEN status = 'Inativo' THEN 'INACTIVE'
        ELSE 'ACTIVE'
      END
    `);

    // Por fim, recriamos o ENUM com os novos valores
    await queryInterface.changeColumn('work_shifts', 'status', {
      type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    });

    // Alterando o tipo do campo user_code para script
    await queryInterface.changeColumn('work_shifts', 'user_code', {
      type: Sequelize.STRING,
      allowNull: false,
      comment: 'Código do usuário no formato script',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Primeiro, alteramos o tipo do ENUM para STRING
    await queryInterface.changeColumn('work_shifts', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // Depois, atualizamos os valores
    await queryInterface.sequelize.query(`
      UPDATE work_shifts
      SET status = CASE
        WHEN status = 'ACTIVE' THEN 'Ativo'
        WHEN status = 'INACTIVE' THEN 'Inativo'
        ELSE 'Ativo'
      END
    `);

    // Por fim, recriamos o ENUM antigo
    await queryInterface.changeColumn('work_shifts', 'status', {
      type: Sequelize.ENUM('Ativo', 'Inativo'),
      allowNull: false,
      defaultValue: 'Ativo',
    });

    // Verificar se a coluna user_code existe antes de tentar renomeá-la
    const tableDescription = await queryInterface.describeTable('work_shifts');

    if (tableDescription.user_code) {
      // Alterando o tipo do campo user_code de volta para string
      await queryInterface.changeColumn('work_shifts', 'user_code', {
        type: Sequelize.STRING,
        allowNull: false,
      });

      // Por fim, renomeamos a coluna de volta
      await queryInterface.renameColumn('work_shifts', 'user_code', 'technician_id');
    }
  },
};
