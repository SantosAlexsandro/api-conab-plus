"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

 class WorkOrderWaitingQueue extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: _sequelize2.default.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        orderNumber: _sequelize2.default.STRING,
        entityName: _sequelize2.default.STRING,
        uraRequestId: _sequelize2.default.STRING,
        technicianAssigned: _sequelize2.default.STRING,
        priority: _sequelize2.default.ENUM('low', 'normal', 'high'),
        status: _sequelize2.default.ENUM(
          'RECEIVED',
          'WAITING_CREATION',
          'WAITING_TECHNICIAN',
          'WAITING_ARRIVAL',
          'IN_PROGRESS',
          'FINISHED',
          'FAILED',
          'CANCELED',
          'FULFILLED'
        ),
        source: {
          type: _sequelize2.default.STRING,
          defaultValue: 'g4flex',
        },
      },
      {
        sequelize,
        tableName: 'work_order_waiting_queue',
        timestamps: true,
        underscored: true,
      }
    );

    return this;
  }
} exports.default = WorkOrderWaitingQueue;
