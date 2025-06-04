"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _dotenv = require('dotenv'); var _dotenv2 = _interopRequireDefault(_dotenv);
var _path = require('path');
var _cors = require('cors'); var _cors2 = _interopRequireDefault(_cors);
// import helmet from 'helmet';

_dotenv2.default.config();

require('./database');

var _express = require('express'); var _express2 = _interopRequireDefault(_express);
var _setup = require('./swagger/setup'); var _setup2 = _interopRequireDefault(_setup);
var _errorHandler = require('./middlewares/errorHandler'); var _errorHandler2 = _interopRequireDefault(_errorHandler);
var _homeRoutes = require('./routes/homeRoutes'); var _homeRoutes2 = _interopRequireDefault(_homeRoutes);
var _entityRoutes = require('./routes/entityRoutes'); var _entityRoutes2 = _interopRequireDefault(_entityRoutes);
var _workOrderRoutes = require('./routes/workOrderRoutes'); var _workOrderRoutes2 = _interopRequireDefault(_workOrderRoutes);
var _workOrderPhotoRoutes = require('./routes/workOrderPhotoRoutes'); var _workOrderPhotoRoutes2 = _interopRequireDefault(_workOrderPhotoRoutes);
var _workOrderAudioRoutes = require('./routes/workOrderAudioRoutes'); var _workOrderAudioRoutes2 = _interopRequireDefault(_workOrderAudioRoutes);
var _workShiftRoutes = require('./routes/workShiftRoutes'); var _workShiftRoutes2 = _interopRequireDefault(_workShiftRoutes);
var _userGroupRoutes = require('./routes/userGroupRoutes'); var _userGroupRoutes2 = _interopRequireDefault(_userGroupRoutes);
var _tokenRoutes = require('./routes/tokenRoutes'); var _tokenRoutes2 = _interopRequireDefault(_tokenRoutes);
var _integrationRoutes = require('./routes/integrationRoutes'); var _integrationRoutes2 = _interopRequireDefault(_integrationRoutes);
// import itemRoutes from './routes/itemRoutes';
// import transactionRoutes from './routes/transactionRoutes';
// import transactionItemRoutes from './routes/transactionItemRoutes';
var _regionsRoutes = require('./routes/regionsRoutes'); var _regionsRoutes2 = _interopRequireDefault(_regionsRoutes);
var _categoryRoutes = require('./routes/categoryRoutes'); var _categoryRoutes2 = _interopRequireDefault(_categoryRoutes);
var _typeServOrdRoutes = require('./routes/typeServOrdRoutes'); var _typeServOrdRoutes2 = _interopRequireDefault(_typeServOrdRoutes);
var _typeAssistanceRoutes = require('./routes/typeAssistanceRoutes'); var _typeAssistanceRoutes2 = _interopRequireDefault(_typeAssistanceRoutes);
var _productRoutes = require('./routes/productRoutes'); var _productRoutes2 = _interopRequireDefault(_productRoutes);
var _cityRoutes = require('./routes/cityRoutes'); var _cityRoutes2 = _interopRequireDefault(_cityRoutes);
var _streetTypeRoutes = require('./routes/streetTypeRoutes'); var _streetTypeRoutes2 = _interopRequireDefault(_streetTypeRoutes);
var _authRoutes = require('./routes/authRoutes'); var _authRoutes2 = _interopRequireDefault(_authRoutes);
var _addressRoutes = require('./routes/addressRoutes'); var _addressRoutes2 = _interopRequireDefault(_addressRoutes);

var _gupshupRoutes = require('./routes/gupshupRoutes'); var _gupshupRoutes2 = _interopRequireDefault(_gupshupRoutes);
var _workOrderWaitingQueueRoutes = require('./routes/workOrderWaitingQueueRoutes'); var _workOrderWaitingQueueRoutes2 = _interopRequireDefault(_workOrderWaitingQueueRoutes);
var _pushNotificationRoutes = require('./routes/pushNotificationRoutes'); var _pushNotificationRoutes2 = _interopRequireDefault(_pushNotificationRoutes);
var _notificationRoutes = require('./routes/notificationRoutes'); var _notificationRoutes2 = _interopRequireDefault(_notificationRoutes);
var _roleRoutes = require('./routes/roleRoutes'); var _roleRoutes2 = _interopRequireDefault(_roleRoutes);
var _permissionRoutes = require('./routes/permissionRoutes'); var _permissionRoutes2 = _interopRequireDefault(_permissionRoutes);
var _userRoleRoutes = require('./routes/userRoleRoutes'); var _userRoleRoutes2 = _interopRequireDefault(_userRoleRoutes);

// G4Flex
var _contractRoutes = require('./integrations/g4flex/routes/contractRoutes'); var _contractRoutes2 = _interopRequireDefault(_contractRoutes);
var _workOrderRoutes3 = require('./integrations/g4flex/routes/workOrderRoutes'); var _workOrderRoutes4 = _interopRequireDefault(_workOrderRoutes3);
var _tokenRoutes3 = require('./integrations/g4flex/routes/tokenRoutes'); var _tokenRoutes4 = _interopRequireDefault(_tokenRoutes3);
var _uraRoutes = require('./integrations/g4flex/routes/uraRoutes'); var _uraRoutes2 = _interopRequireDefault(_uraRoutes);

// ERP Integration
var _technicianRoutes = require('./integrations/erp/routes/technicianRoutes'); var _technicianRoutes2 = _interopRequireDefault(_technicianRoutes);

const whiteList = [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:3002',
  'https://app.conabplus.com.br',
  'https://staging.conabplus.com.br'
];

// Configuração CORS para desenvolvimento
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requisições sem origin (como mobile apps ou curl)
    if (!origin) return callback(null, true);
    // Para o ambiente de desenvolvimento, permitir qualquer origem
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

class App {
  constructor() {
    this.app = _express2.default.call(void 0, );
    this.middlewares();
    this.routes();
    this.swagger();
    this.errorHandler();
  }

  middlewares() {
    this.app.use(_cors2.default.call(void 0, corsOptions));
    // this.app.use(helmet());
    this.app.use(_express2.default.urlencoded({ extended: true, limit: '50mb' }));
    this.app.use(_express2.default.json({ limit: '50mb' }));
    // this.app.use('/images/', express.static(resolve(__dirname, '..', 'uploads', 'images')));
  }

  routes() {
    this.app.use('/', _homeRoutes2.default);
    this.app.use('/entities/', _entityRoutes2.default);
    this.app.use('/work-orders/', _workOrderRoutes2.default);
    this.app.use('/work-orders-photos/', _workOrderPhotoRoutes2.default);
    this.app.use('/work-orders-audios/', _workOrderAudioRoutes2.default);
    this.app.use('/work-shifts/', _workShiftRoutes2.default);
    this.app.use('/erp-user-groups/', _userGroupRoutes2.default);
    this.app.use('/tokens/', _tokenRoutes2.default);
    this.app.use('/api/', _regionsRoutes2.default);
    this.app.use('/api/', _categoryRoutes2.default);
    this.app.use('/types-serv-ord/', _typeServOrdRoutes2.default);
    this.app.use('/types-assistance/', _typeAssistanceRoutes2.default);
    this.app.use('/products/', _productRoutes2.default);
    this.app.use('/cities/', _cityRoutes2.default);
    this.app.use('/street-types/', _streetTypeRoutes2.default);
    this.app.use('/auth/', _authRoutes2.default);
    this.app.use('/api/', _addressRoutes2.default);
    this.app.use('/user-groups/', _userGroupRoutes2.default);
    this.app.use('/work-order-queue/', _workOrderWaitingQueueRoutes2.default);
    this.app.use('/notifications/', _pushNotificationRoutes2.default);
    this.app.use('/api/notifications/', _notificationRoutes2.default);
    //this.app.use('/gupshup/', gupshupRoutes);

    // Novas rotas de permissões e perfis
    this.app.use('/roles/', _roleRoutes2.default);
    this.app.use('/permissions/', _permissionRoutes2.default);
    this.app.use('/users/', _userRoleRoutes2.default);

    // G4Flex
    this.app.use('/api/integrations/g4flex/contracts/', _contractRoutes2.default);
    this.app.use('/api/integrations/g4flex/work-orders/', _workOrderRoutes4.default);
    this.app.use('/api/integrations/g4flex/ura/', _uraRoutes2.default);
    this.app.use('/api/integrations/g4flex/token', _tokenRoutes4.default);

    // ERP Integration
    this.app.use('/api/integrations/erp/technicians', _technicianRoutes2.default);

    //this.app.use('/transactions/', transactionRoutes);
    //this.app.use('/items/', itemRoutes);
    //this.app.use('/transactions/items/', transactionItemRoutes);

    this.app.use('/token', _tokenRoutes2.default);
    this.app.use('/api/integrations', _integrationRoutes2.default);
  }

  swagger() {
    _setup2.default.call(void 0, this.app);
  }

  errorHandler() {
    // Middleware global de tratamento de erros - deve ser o último middleware
    this.app.use(_errorHandler2.default);
  }
}

exports. default = new App().app;
