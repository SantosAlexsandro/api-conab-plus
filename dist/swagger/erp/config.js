"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _swaggerjsdoc = require('swagger-jsdoc'); var _swaggerjsdoc2 = _interopRequireDefault(_swaggerjsdoc);
var _index = require('./index'); var _index2 = _interopRequireDefault(_index);
require('./routes');

const options = {
  swaggerDefinition: _index2.default,
  apis: [
    './src/swagger/erp/routes.js',
    './src/routes/authRoutes.js',
    './src/routes/userGroupRoutes.js',
    './src/routes/entityRoutes.js',
    './src/routes/productRoutes.js'
  ]
};

const erpSwaggerSpec = _swaggerjsdoc2.default.call(void 0, options);

exports. default = erpSwaggerSpec;
