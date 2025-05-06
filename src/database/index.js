import Sequelize from 'sequelize';
import databaseConfig from '../config/database';
import City from '../models/City';
import UserSession from '../models/UserSession';
import WorkShift from '../models/WorkShift';
import RequestLog from '../models/RequestLog';
import WorkOrderWaitingQueue from '../models/workOrderWaitingQueue';
import PushSubscription from '../models/PushSubscription';

const models = [
  City,
  UserSession,
  WorkShift,
  RequestLog,
  WorkOrderWaitingQueue,
  PushSubscription,
];

const connection = new Sequelize(databaseConfig);

models.forEach((model) => model.init(connection));
models.forEach((model) => model.associate && model.associate(connection.models));
