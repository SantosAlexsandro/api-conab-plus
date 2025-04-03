// models/IntegrationAttempt.js
module.exports = (sequelize, DataTypes) => {
  const IntegrationAttempt = sequelize.define('IntegrationAttempt', {
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
    type: {
      type: DataTypes.ENUM('create_os', 'cancel_os'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'success', 'failed'),
      defaultValue: 'pending'
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    lastAttemptAt: DataTypes.DATE,
    errorMessage: DataTypes.TEXT
  }, {
    tableName: 'integration_attempts',
    underscored: true,
  });

  return IntegrationAttempt;
};
