"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

 class PushSubscription extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: _sequelize2.default.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        endpoint: {
          type: _sequelize2.default.TEXT,
          allowNull: false,
        },
        expirationTime: {
          type: _sequelize2.default.DATE,
          allowNull: true,
        },
        p256dh: {
          type: _sequelize2.default.TEXT,
          allowNull: false,
        },
        auth: {
          type: _sequelize2.default.STRING,
          allowNull: false,
        },
        userId: {
          type: _sequelize2.default.INTEGER,
          allowNull: true,
          field: 'user_id'
        },
        userName: {
          type: _sequelize2.default.STRING(100),
          allowNull: true,
          field: 'user_name'
        },
        active: {
          type: _sequelize2.default.BOOLEAN,
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
} exports.default = PushSubscription;
