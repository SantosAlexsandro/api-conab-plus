"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// models/RequestLog.js
var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

 class RequestLog extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: _sequelize2.default.UUID,
          defaultValue: _sequelize2.default.UUIDV4,
          primaryKey: true
        },
        uraRequestId: {
          type: _sequelize2.default.UUID,
          allowNull: false,
          field: 'ura_request_id'
        },
        source: {
          type: _sequelize2.default.STRING,
          allowNull: false,
          validate: {
            isIn: [['ura', 'g4flex', 'conab', 'system', 'controller_g4flex', 'service_g4flex']]
          }
        },
        action: {
          type: _sequelize2.default.STRING,
          allowNull: false
        },
        payloadSnapshot: {
          type: _sequelize2.default.JSON,
          allowNull: true,
          field: 'payload_snapshot'
        },
        responseSnapshot: {
          type: _sequelize2.default.JSON,
          allowNull: true,
          field: 'response_snapshot'
        },
        statusCode: {
          type: _sequelize2.default.INTEGER,
          allowNull: true,
          field: 'status_code'
        },
        error: {
          type: _sequelize2.default.TEXT,
          allowNull: true
        },
        timestamp: {
          type: _sequelize2.default.DATE,
          defaultValue: _sequelize2.default.NOW
        }
      },
      {
        sequelize,
        tableName: 'request_logs',
        underscored: true,
        timestamps: false
      }
    );
    return this;
  }
} exports.default = RequestLog;
