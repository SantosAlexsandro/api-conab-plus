"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

 class RolePermission extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        roleId: {
          type: _sequelize2.default.INTEGER,
          allowNull: false,
          field: 'role_id',
        },
        permissionId: {
          type: _sequelize2.default.INTEGER,
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
} exports.default = RolePermission;
