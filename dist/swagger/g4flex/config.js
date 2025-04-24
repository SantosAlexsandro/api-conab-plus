"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _swaggerjsdoc = require('swagger-jsdoc'); var _swaggerjsdoc2 = _interopRequireDefault(_swaggerjsdoc);
var _index = require('./index'); var _index2 = _interopRequireDefault(_index);
require('./contracts');
require('./workOrders');

/**
 * Define which swagger files should be included based on environment
 * @returns {object} Options for swagger-jsdoc
 */
const getSwaggerOptions = () => {
  // Base API files that are always included
  const baseApiFiles = [
    './src/routes/g4flex/contractRoutes.js',
    './src/routes/g4flex/workOrderRoutes.js'
  ];

  // Base Swagger documentation files
  const baseSwaggerFiles = [
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

  // In production, filter to include only routes with 'Public' tag
  const filteredSpec = JSON.parse(JSON.stringify(g4flexSwaggerSpec));

  if (filteredSpec.paths) {
    filteredSpec.paths = Object.fromEntries(
      Object.entries(filteredSpec.paths).filter(([_, pathItem]) =>
        Object.values(pathItem).some(operation =>
          _optionalChain([operation, 'access', _2 => _2.tags, 'optionalAccess', _3 => _3.includes, 'call', _4 => _4('Public')])
        )
      )
    );
  }

  return filteredSpec;
};

exports. default = getFilteredSpec();
