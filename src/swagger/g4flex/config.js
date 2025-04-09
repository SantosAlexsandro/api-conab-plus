import swaggerJsDoc from 'swagger-jsdoc';
import swaggerDefinition from './index';
import './contracts';
import './workOrders';

const options = {
  swaggerDefinition,
  apis: [
    './src/swagger/g4flex/contracts.js',
    './src/swagger/g4flex/workOrders.js',
    './src/routes/g4flex/contractRoutes.js',
    './src/routes/g4flex/workOrderRoutes.js'
  ]
};

const g4flexSwaggerSpec = swaggerJsDoc(options);

export default g4flexSwaggerSpec;
