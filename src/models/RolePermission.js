import Sequelize, { Model } from "sequelize";

export default class RolePermission extends Model {
  static init(sequelize) {
    super.init(
      {
        roleId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          field: 'role_id',
        },
        permissionId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          field: 'permission_id',
        },
      },
      {
        sequelize,
        tableName: 'role_permissions',
      }
    );
    return this;
  }
}
