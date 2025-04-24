import dotenv from 'dotenv';
import { resolve } from 'path';
import cors from 'cors';
// import helmet from 'helmet';

dotenv.config();

import './database';

import express from 'express';
import setupSwagger from './swagger/setup';
import errorHandler from './middlewares/errorHandler';
import homeRoutes from './routes/homeRoutes';
import entityRoutes from './routes/entityRoutes';
import workOrderRoutes from './routes/workOrderRoutes';
import workOrderPhotoRoutes from './routes/workOrderPhotoRoutes';
import workOrderAudioRoutes from './routes/workOrderAudioRoutes';
import workShiftRoutes from './routes/workShiftRoutes';
import erpUserGroupRoutes from './routes/userGroupRoutes';
import tokenRoutes from './routes/tokenRoutes';
// import itemRoutes from './routes/itemRoutes';
// import transactionRoutes from './routes/transactionRoutes';
// import transactionItemRoutes from './routes/transactionItemRoutes';
import regionsRoutes from './routes/regionsRoutes';
import categoryRoutes from './routes/categoryRoutes';
import typeServOrdRoutes from './routes/typeServOrdRoutes';
import typeAssistanceRoutes from './routes/typeAssistanceRoutes';
import productRoutes from './routes/productRoutes';
import cityRoutes from './routes/cityRoutes';
import streetTypeRoutes from './routes/streetTypeRoutes'
import authRoutes from './routes/authRoutes'
import addressRoutes from './routes/addressRoutes'
import userGroupRoutes from './routes/userGroupRoutes'
import gupshupRoutes from './routes/gupshupRoutes'

// G4Flex
import g4flexContractRoutes from './integrations/g4flex/routes/contractRoutes'
import g4flexWorkOrderRoutes from './integrations/g4flex/routes/workOrderRoutes'

const whiteList = [
  'http://localhost:8080',
  'https://app.conabplus.com.br',
  'https://staging.conabplus.com.br'
];

const corsOptions = {
  origin(origin, callback) {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

class App {
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
    this.swagger();
    this.errorHandler();
  }

  middlewares() {
    this.app.use(cors(corsOptions));
    // this.app.use(helmet());
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    this.app.use(express.json({ limit: '50mb' }));
    // this.app.use('/images/', express.static(resolve(__dirname, '..', 'uploads', 'images')));
  }

  routes() {
    this.app.use('/', homeRoutes);
    this.app.use('/entities/', entityRoutes);
    this.app.use('/work-orders/', workOrderRoutes);
    this.app.use('/work-orders-photos/', workOrderPhotoRoutes);
    this.app.use('/work-orders-audios/', workOrderAudioRoutes);
    this.app.use('/work-shifts/', workShiftRoutes);
    this.app.use('/erp-user-groups/', erpUserGroupRoutes);
    this.app.use('/tokens/', tokenRoutes);
    this.app.use('/api/', regionsRoutes);
    this.app.use('/api/', categoryRoutes);
    this.app.use('/types-serv-ord/', typeServOrdRoutes);
    this.app.use('/types-assistance/', typeAssistanceRoutes);
    this.app.use('/products/', productRoutes);
    this.app.use('/cities/', cityRoutes);
    this.app.use('/street-types/', streetTypeRoutes);
    this.app.use('/auth/', authRoutes);
    this.app.use('/api/', addressRoutes);
    this.app.use('/user-groups/', userGroupRoutes);
    //this.app.use('/gupshup/', gupshupRoutes);

    // G4Flex
    this.app.use('/g4flex/contracts/', g4flexContractRoutes);
    this.app.use('/g4flex/work-orders/', g4flexWorkOrderRoutes);

    //this.app.use('/transactions/', transactionRoutes);
    //this.app.use('/items/', itemRoutes);
    //this.app.use('/transactions/items/', transactionItemRoutes);
  }

  swagger() {
    setupSwagger(this.app);
  }

  errorHandler() {
    // Middleware global de tratamento de erros - deve ser o último middleware
    this.app.use(errorHandler);
  }
}

export default new App().app;
