import Sequelize, { Model } from "sequelize";

export default class UserSession extends Model {
  static init(sequelize) {
    super.init(
      {
        userName: { // Alias para user_name
          type: Sequelize.STRING,
          allowNull: false,
          field: 'user_name', // Nome da coluna no banco
        },
        encryptedPassword: {
          type: Sequelize.TEXT,
          allowNull: false,
          field: 'encrypted_password',
        },
        sessionToken: {
          type: Sequelize.TEXT,
          allowNull: false,
          field: 'session_token',
        },
        sessionExpiration: {
          type: Sequelize.DATE,
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
}
