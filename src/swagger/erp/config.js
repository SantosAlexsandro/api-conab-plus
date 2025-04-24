import swaggerJsDoc from 'swagger-jsdoc';
import swaggerDefinition from './index';
import './routes';

/**
 * Define which swagger files should be included based on environment
 * @returns {object} Options for swagger-jsdoc
 */
const getSwaggerOptions = () => {
  // Base API files that are always included
  const baseApiFiles = [
    './src/routes/authRoutes.js',
    './src/routes/userGroupRoutes.js',
    './src/routes/entityRoutes.js',
    './src/routes/productRoutes.js'
  ];

  // Base Swagger documentation files
  const baseSwaggerFiles = [
    './src/swagger/erp/routes.js'
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
const erpSwaggerSpec = swaggerJsDoc(getSwaggerOptions());

// Filter the paths based on environment
const getFilteredSpec = () => {
  // In non-production environments, return the full spec
  if (process.env.NODE_ENV !== 'production') {
    return erpSwaggerSpec;
  }

  // In production, filter to include only routes with 'Public' tag
  const filteredSpec = JSON.parse(JSON.stringify(erpSwaggerSpec));

  if (filteredSpec.paths) {
    filteredSpec.paths = Object.fromEntries(
      Object.entries(filteredSpec.paths).filter(([_, pathItem]) =>
        Object.values(pathItem).some(operation =>
          operation.tags?.includes('Public')
        )
      )
    );
  }

  return filteredSpec;
};

export default getFilteredSpec();
