module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_roles', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_name: {
        type: Sequelize.STRING,
        allowNull: false,
        references: { model: 'user_sessions', key: 'user_name' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'roles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });

    // Garante que um usuário não terá o mesmo perfil duplicado
    await queryInterface.addIndex('user_roles', ['user_name', 'role_id'], {
      unique: true,
      name: 'user_roles_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_roles');
  },
};
