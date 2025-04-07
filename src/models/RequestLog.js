// models/RequestLog.js
import Sequelize, { Model } from "sequelize";

export default class RequestLog extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        uraRequestId: {
          type: Sequelize.UUID,
          allowNull: false,
          field: 'ura_request_id'
        },
        source: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            isIn: [['ura', 'g4flex', 'conab', 'system', 'controller_g4flex', 'service_g4flex']]
          }
        },
        action: {
          type: Sequelize.STRING,
          allowNull: false
        },
        payloadSnapshot: {
          type: Sequelize.JSON,
          allowNull: true,
          field: 'payload_snapshot'
        },
        responseSnapshot: {
          type: Sequelize.JSON,
          allowNull: true,
          field: 'response_snapshot'
        },
        statusCode: {
          type: Sequelize.INTEGER,
          allowNull: true,
          field: 'status_code'
        },
        error: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        timestamp: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
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
}
