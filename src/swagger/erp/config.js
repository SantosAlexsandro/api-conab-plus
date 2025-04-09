import swaggerJsDoc from 'swagger-jsdoc';
import swaggerDefinition from './index';
import './routes';

const options = {
  swaggerDefinition,
  apis: [
    './src/swagger/erp/routes.js',
    './src/routes/authRoutes.js',
    './src/routes/userGroupRoutes.js',
    './src/routes/entityRoutes.js',
    './src/routes/productRoutes.js'
  ]
};

const erpSwaggerSpec = swaggerJsDoc(options);

export default erpSwaggerSpec;
