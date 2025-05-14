"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

 class UserRole extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        userName: {
          type: _sequelize2.default.STRING,
          allowNull: false,
          field: 'user_name',
        },
        roleId: {
          type: _sequelize2.default.INTEGER,
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
} exports.default = UserRole;
