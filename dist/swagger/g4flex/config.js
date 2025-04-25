"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _swaggerjsdoc = require('swagger-jsdoc'); var _swaggerjsdoc2 = _interopRequireDefault(_swaggerjsdoc);
var _index = require('./index'); var _index2 = _interopRequireDefault(_index);
require('./auth');
require('./contracts');
require('./workOrders');

/**
 * Define which swagger files should be included based on environment
 * @returns {object} Options for swagger-jsdoc
 */
const getSwaggerOptions = () => {
  // Base API files that are always included
  const baseApiFiles = [
    './src/integrations/g4flex/routes/tokenRoutes.js',
    './src/integrations/g4flex/routes/contractRoutes.js',
    './src/integrations/g4flex/routes/workOrderRoutes.js'
  ];

  // Base Swagger documentation files
  const baseSwaggerFiles = [
    './src/swagger/g4flex/auth.js',
    './src/swagger/g4flex/contracts.js',
    './src/swagger/g4flex/workOrders.js'
  ];

  // In production, we can filter specific APIs if needed
  let apis = [...baseSwaggerFiles, ...baseApiFiles];

  // Customize Swagger options based on environment
  const swaggerOptions = {
    swaggerDefinition: _index2.default,
    apis
  };

  return swaggerOptions;
};

// Generate the Swagger specification
const g4flexSwaggerSpec = _swaggerjsdoc2.default.call(void 0, getSwaggerOptions());

// Filter the paths based on environment
const getFilteredSpec = () => {
  // In non-production environments, return the full spec
  if (process.env.NODE_ENV !== 'production') {
    return g4flexSwaggerSpec;
  }

  // In production, filter to include only routes with x-public attribute set to true
  const filteredSpec = JSON.parse(JSON.stringify(g4flexSwaggerSpec));

  if (filteredSpec.paths) {
    filteredSpec.paths = Object.fromEntries(
      Object.entries(filteredSpec.paths).filter(([_, pathItem]) =>
        Object.values(pathItem).some(operation =>
          operation['x-public'] === true
        )
      )
    );
  }

  return filteredSpec;
};

exports. default = getFilteredSpec();
