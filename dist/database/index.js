"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);
var _database = require('../config/database'); var _database2 = _interopRequireDefault(_database);
var _City = require('../models/City'); var _City2 = _interopRequireDefault(_City);
var _UserSession = require('../models/UserSession'); var _UserSession2 = _interopRequireDefault(_UserSession);
var _WorkShift = require('../models/WorkShift'); var _WorkShift2 = _interopRequireDefault(_WorkShift);
var _RequestLog = require('../models/RequestLog'); var _RequestLog2 = _interopRequireDefault(_RequestLog);
var _workOrderWaitingQueue = require('../models/workOrderWaitingQueue'); var _workOrderWaitingQueue2 = _interopRequireDefault(_workOrderWaitingQueue);

const models = [
  _City2.default,
  _UserSession2.default,
  _WorkShift2.default,
  _RequestLog2.default,
  _workOrderWaitingQueue2.default,
];

const connection = new (0, _sequelize2.default)(_database2.default);

models.forEach((model) => model.init(connection));
models.forEach((model) => model.associate && model.associate(connection.models));
