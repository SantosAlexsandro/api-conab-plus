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

// G4Flex
var _contractRoutes = require('./integrations/g4flex/routes/contractRoutes'); var _contractRoutes2 = _interopRequireDefault(_contractRoutes);
var _workOrderRoutes3 = require('./integrations/g4flex/routes/workOrderRoutes'); var _workOrderRoutes4 = _interopRequireDefault(_workOrderRoutes3);
var _tokenRoutes3 = require('./integrations/g4flex/routes/tokenRoutes'); var _tokenRoutes4 = _interopRequireDefault(_tokenRoutes3);

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
    //this.app.use('/gupshup/', gupshupRoutes);

    // G4Flex
    this.app.use('/api/integrations/g4flex/contracts/', _contractRoutes2.default);
    this.app.use('/g4flex/work-orders/', _workOrderRoutes4.default);
    this.app.use('/api/integrations/g4flex/token', _tokenRoutes4.default);

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
