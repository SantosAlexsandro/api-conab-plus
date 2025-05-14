import Sequelize, { Model } from "sequelize";

export default class Role extends Model {
  static init(sequelize) {
    super.init(
      {
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          field: 'is_active',
        },
      },
      {
        sequelize,
        tableName: 'roles',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsToMany(models.Permission, {
      foreignKey: 'role_id',
      through: 'role_permissions',
      as: 'permissions',
    });

    this.belongsToMany(models.UserSession, {
      foreignKey: 'role_id',
      otherKey: 'user_name',
      through: 'user_roles',
      as: 'users',
      targetKey: 'userName',
    });
  }
}
