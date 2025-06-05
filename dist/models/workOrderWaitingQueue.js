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
        orderNumber: {
          type: _sequelize2.default.STRING,
          unique: true,
        },
        entityName: _sequelize2.default.STRING,
        uraRequestId: {
          type: _sequelize2.default.STRING,
          unique: true,
        },
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
          'FULFILLED',
          'URA_FAILURE'
        ),
        source: {
          type: _sequelize2.default.STRING,
          defaultValue: 'g4flex',
        },
        customerIdentifier: _sequelize2.default.STRING,
        productId: _sequelize2.default.STRING,
        requesterNameAndPosition: _sequelize2.default.STRING,
        incidentAndReceiverName: _sequelize2.default.STRING,
        requesterContact: _sequelize2.default.STRING,
        callerPhoneNumber: _sequelize2.default.STRING,
        cancellationRequesterInfo: _sequelize2.default.STRING,
        failureReason: _sequelize2.default.TEXT,
        customerStreet: _sequelize2.default.STRING,
        customerNumber: _sequelize2.default.STRING,
        customerAddressComplement: _sequelize2.default.STRING,
        customerNeighborhood: _sequelize2.default.STRING,
        customerCity: _sequelize2.default.STRING,
        customerState: _sequelize2.default.STRING,
        customerZipCode: _sequelize2.default.STRING,
        customerCityErpCode: _sequelize2.default.STRING,
        customerStreetTypeCode: _sequelize2.default.STRING,
        isEditing: {
          type: _sequelize2.default.BOOLEAN,
          defaultValue: false,
        },
        editedAt: _sequelize2.default.DATE,
        editedBy: _sequelize2.default.STRING,
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
