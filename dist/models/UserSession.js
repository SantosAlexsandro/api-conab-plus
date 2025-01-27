"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

 class UserSession extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        userName: { // Alias para user_name
          type: _sequelize2.default.STRING,
          allowNull: false,
          field: 'user_name', // Nome da coluna no banco
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
} exports.default = UserSession;
