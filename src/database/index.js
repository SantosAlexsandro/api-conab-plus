import Sequelize from 'sequelize';
import databaseConfig from '../config/database';
import City from '../models/City';
import UserSession from '../models/UserSession'

const models = [
  City,
  UserSession
];

const connection = new Sequelize(databaseConfig);

models.forEach((model) => model.init(connection));
models.forEach((model) => model.associate && model.associate(connection.models));
