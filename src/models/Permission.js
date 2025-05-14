import Sequelize, { Model } from "sequelize";

export default class Permission extends Model {
  static init(sequelize) {
    super.init(
      {
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        slug: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        module: {
          type: Sequelize.STRING,
          allowNull: false,
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
        tableName: 'permissions',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsToMany(models.Role, {
      foreignKey: 'permission_id',
      through: 'role_permissions',
      as: 'roles',
    });
  }
}
