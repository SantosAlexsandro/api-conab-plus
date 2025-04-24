import swaggerJsDoc from 'swagger-jsdoc';
import swaggerDefinition from './index';
import './auth';
import './contracts';
import './workOrders';

/**
 * Define which swagger files should be included based on environment
 * @returns {object} Options for swagger-jsdoc
 */
const getSwaggerOptions = () => {
  // Base API files that are always included
  const baseApiFiles = [
    './src/routes/tokenRoutes.js',
    './src/routes/g4flex/contractRoutes.js',
    './src/routes/g4flex/workOrderRoutes.js'
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
    swaggerDefinition,
    apis
  };

  return swaggerOptions;
};

// Generate the Swagger specification
const g4flexSwaggerSpec = swaggerJsDoc(getSwaggerOptions());

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

export default getFilteredSpec();
