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
        keys: {
          type: _sequelize2.default.JSON,
          allowNull: false,
        },
        userId: {
          type: _sequelize2.default.INTEGER,
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
} exports.default = PushSubscription;
