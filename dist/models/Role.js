"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

 class Role extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        name: {
          type: _sequelize2.default.STRING,
          allowNull: false,
          unique: true,
        },
        description: {
          type: _sequelize2.default.TEXT,
          allowNull: true,
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
} exports.default = Role;
