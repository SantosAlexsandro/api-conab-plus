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
        keys: {
          type: Sequelize.JSON,
          allowNull: false,
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
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
