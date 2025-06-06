import Sequelize from 'sequelize';
import databaseConfig from '../config/database';
import City from '../models/City';
import UserSession from '../models/UserSession';
import WorkShift from '../models/WorkShift';
import RequestLog from '../models/RequestLog';
import WorkOrderWaitingQueue from '../models/workOrderWaitingQueue';
import PushSubscription from '../models/PushSubscription';
import Role from '../models/Role';
import Permission from '../models/Permission';
import RolePermission from '../models/RolePermission';
import UserRole from '../models/UserRole';
import Notification from '../models/Notification';
import TeamsToken from '../models/TeamsToken';

const models = [
  City,
  UserSession,
  WorkShift,
  RequestLog,
  WorkOrderWaitingQueue,
  PushSubscription,
  Role,
  Permission,
  RolePermission,
  UserRole,
  Notification,
  TeamsToken,
];

const connection = new Sequelize(databaseConfig);

models.forEach((model) => model.init(connection));
models.forEach((model) => model.associate && model.associate(connection.models));

export default connection;
