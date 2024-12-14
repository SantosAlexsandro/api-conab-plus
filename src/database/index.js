import Sequelize from 'sequelize';
import databaseConfig from '../config/database';
import City from '../models/City';

const models = [
  City
];

const connection = new Sequelize(databaseConfig);

models.forEach((model) => model.init(connection));
models.forEach((model) => model.associate && model.associate(connection.models));
