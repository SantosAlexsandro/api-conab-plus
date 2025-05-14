"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

 class UserSession extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        userName: { // Alias para user_name
          type: _sequelize2.default.STRING,
          allowNull: false,
          field: 'user_name', // Nome da coluna no banco
          primaryKey: true, // Definindo como chave primária para associação
        },
        encryptedPassword: {
          type: _sequelize2.default.TEXT,
          allowNull: false,
          field: 'encrypted_password',
        },
        sessionToken: {
          type: _sequelize2.default.TEXT,
          allowNull: false,
          field: 'session_token',
        },
        sessionExpiration: {
          type: _sequelize2.default.DATE,
          allowNull: false,
          field: 'session_expiration',
        }
      },
      {
        sequelize,
        tableName: 'user_sessions', // Nome da tabela no banco
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsToMany(models.Role, {
      foreignKey: 'user_name',
      otherKey: 'role_id',
      through: 'user_roles',
      as: 'roles',
      sourceKey: 'userName', // Especifica que a chave fonte é userName
    });
  }
} exports.default = UserSession;
