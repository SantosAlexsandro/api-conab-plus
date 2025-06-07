"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);
var _database = require('../config/database'); var _database2 = _interopRequireDefault(_database);
var _City = require('../models/City'); var _City2 = _interopRequireDefault(_City);
var _UserSession = require('../models/UserSession'); var _UserSession2 = _interopRequireDefault(_UserSession);
var _WorkShift = require('../models/WorkShift'); var _WorkShift2 = _interopRequireDefault(_WorkShift);
var _RequestLog = require('../models/RequestLog'); var _RequestLog2 = _interopRequireDefault(_RequestLog);
var _workOrderWaitingQueue = require('../models/workOrderWaitingQueue'); var _workOrderWaitingQueue2 = _interopRequireDefault(_workOrderWaitingQueue);
var _PushSubscription = require('../models/PushSubscription'); var _PushSubscription2 = _interopRequireDefault(_PushSubscription);
var _Role = require('../models/Role'); var _Role2 = _interopRequireDefault(_Role);
var _Permission = require('../models/Permission'); var _Permission2 = _interopRequireDefault(_Permission);
var _RolePermission = require('../models/RolePermission'); var _RolePermission2 = _interopRequireDefault(_RolePermission);
var _UserRole = require('../models/UserRole'); var _UserRole2 = _interopRequireDefault(_UserRole);
var _Notification = require('../models/Notification'); var _Notification2 = _interopRequireDefault(_Notification);
var _TeamsToken = require('../models/TeamsToken'); var _TeamsToken2 = _interopRequireDefault(_TeamsToken);

const models = [
  _City2.default,
  _UserSession2.default,
  _WorkShift2.default,
  _RequestLog2.default,
  _workOrderWaitingQueue2.default,
  _PushSubscription2.default,
  _Role2.default,
  _Permission2.default,
  _RolePermission2.default,
  _UserRole2.default,
  _Notification2.default,
  _TeamsToken2.default,
];

const connection = new (0, _sequelize2.default)(_database2.default);

models.forEach((model) => model.init(connection));
models.forEach((model) => model.associate && model.associate(connection.models));

exports. default = connection;
