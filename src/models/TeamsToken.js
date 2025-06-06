import { Model, DataTypes } from 'sequelize';

export default class TeamsToken extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        user_id: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
          comment: 'ID único do usuário Teams (ex: work_order_bot)'
        },
        access_token: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: 'Access token para API do Microsoft Graph'
        },
        refresh_token: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: 'Refresh token para renovação automática'
        },
        token_type: {
          type: DataTypes.STRING(50),
          defaultValue: 'Bearer',
          comment: 'Tipo do token (normalmente Bearer)'
        },
        scope: {
          type: DataTypes.TEXT,
          comment: 'Escopos autorizados para o token'
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false,
          comment: 'Data/hora de expiração do access token'
        },
        expires_in: {
          type: DataTypes.INTEGER,
          comment: 'Tempo de vida do token em segundos'
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          comment: 'Se o token está ativo e válido'
        }
      },
      {
        sequelize,
        tableName: 'teams_tokens',
        underscored: true,
        timestamps: true,
        paranoid: true, // Soft delete
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        indexes: [
          {
            fields: ['user_id'],
            unique: true
          },
          {
            fields: ['expires_at']
          },
          {
            fields: ['is_active']
          }
        ]
      }
    );

    return this;
  }

  // Métodos de instância
  isExpired() {
    return new Date() > this.expires_at;
  }

  isExpiringSoon(minutesFromNow = 5) {
    const threshold = new Date(Date.now() + (minutesFromNow * 60 * 1000));
    return this.expires_at <= threshold;
  }

  // Métodos estáticos
  static async findActiveByUserId(userId) {
    return this.findOne({
      where: {
        user_id: userId,
        is_active: true,
        expires_at: {
          [this.sequelize.Sequelize.Op.gt]: new Date()
        }
      }
    });
  }

  static async deactivateUser(userId) {
    return this.update({
      is_active: false
    }, {
      where: { user_id: userId, is_active: true }
    });
  }

  static async cleanupExpired() {
    const oneDayAgo = new Date(Date.now() - (24 * 60 * 60 * 1000));

    return this.destroy({
      where: {
        expires_at: {
          [this.sequelize.Sequelize.Op.lt]: oneDayAgo
        }
      },
      force: true // Hard delete para tokens muito antigos
    });
  }
}
