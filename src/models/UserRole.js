import Sequelize, { Model } from "sequelize";

export default class UserRole extends Model {
  static init(sequelize) {
    super.init(
      {
        userName: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'user_name',
        },
        roleId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          field: 'role_id',
        },
      },
      {
        sequelize,
        tableName: 'user_roles',
      }
    );
    return this;
  }
}
