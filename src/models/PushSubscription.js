import Sequelize, { Model } from 'sequelize';

export default class PushSubscription extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        endpoint: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        expirationTime: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        p256dh: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        auth: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          field: 'user_id'
        },
        active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        }
      },
      {
        sequelize,
        tableName: 'push_subscriptions',
        timestamps: true,
        underscored: true,
      }
    );

    return this;
  }
}
