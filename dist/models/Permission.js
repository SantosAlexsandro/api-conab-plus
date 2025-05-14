"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

 class Permission extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        name: {
          type: _sequelize2.default.STRING,
          allowNull: false,
          unique: true,
        },
        slug: {
          type: _sequelize2.default.STRING,
          allowNull: false,
          unique: true,
        },
        description: {
          type: _sequelize2.default.TEXT,
          allowNull: true,
        },
        module: {
          type: _sequelize2.default.STRING,
          allowNull: false,
        },
        isActive: {
          type: _sequelize2.default.BOOLEAN,
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
} exports.default = Permission;
