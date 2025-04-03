// models/RequestLog.js
module.exports = (sequelize, DataTypes) => {
  const RequestLog = sequelize.define('RequestLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    uraRequestId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'ura_request_id'
    },
    source: DataTypes.STRING, // ura | g4flex | conab | system
    action: DataTypes.STRING,
    payloadSnapshot: DataTypes.JSON,
    statusCode: DataTypes.INTEGER,
    error: DataTypes.TEXT,
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'request_logs',
    underscored: true,
  });

  return RequestLog;
};
