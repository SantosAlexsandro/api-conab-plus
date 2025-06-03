import Sequelize, { Model } from 'sequelize';

export default class WorkOrderWaitingQueue extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        orderNumber: {
          type: Sequelize.STRING,
          unique: true,
        },
        entityName: Sequelize.STRING,
        uraRequestId: {
          type: Sequelize.STRING,
          unique: true,
        },
        technicianAssigned: Sequelize.STRING,
        priority: Sequelize.ENUM('low', 'normal', 'high'),
        status: Sequelize.ENUM(
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
          type: Sequelize.STRING,
          defaultValue: 'g4flex',
        },
        customerIdentifier: Sequelize.STRING,
        productId: Sequelize.STRING,
        requesterNameAndPosition: Sequelize.STRING,
        incidentAndReceiverName: Sequelize.STRING,
        requesterContact: Sequelize.STRING,
        cancellationRequesterInfo: Sequelize.STRING,
        failureReason: Sequelize.TEXT,
        customerStreet: Sequelize.STRING,
        customerNumber: Sequelize.STRING,
        customerAddressComplement: Sequelize.STRING,
        customerNeighborhood: Sequelize.STRING,
        customerCity: Sequelize.STRING,
        customerState: Sequelize.STRING,
        customerZipCode: Sequelize.STRING,
        customerCityErpCode: Sequelize.STRING,
        customerStreetTypeCode: Sequelize.STRING,
        isEditing: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        editedAt: Sequelize.DATE,
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
}
