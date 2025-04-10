"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _swaggerjsdoc = require('swagger-jsdoc'); var _swaggerjsdoc2 = _interopRequireDefault(_swaggerjsdoc);
var _index = require('./index'); var _index2 = _interopRequireDefault(_index);
require('./contracts');
require('./workOrders');

const options = {
  swaggerDefinition: _index2.default,
  apis: [
    './src/swagger/g4flex/contracts.js',
    './src/swagger/g4flex/workOrders.js',
    './src/routes/g4flex/contractRoutes.js',
    './src/routes/g4flex/workOrderRoutes.js'
  ]
};

const g4flexSwaggerSpec = _swaggerjsdoc2.default.call(void 0, options);

exports. default = g4flexSwaggerSpec;
