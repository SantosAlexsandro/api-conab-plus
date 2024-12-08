"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _dotenv = require('dotenv'); var _dotenv2 = _interopRequireDefault(_dotenv);
var _path = require('path');
var _cors = require('cors'); var _cors2 = _interopRequireDefault(_cors);
// import helmet from 'helmet';

_dotenv2.default.config();

require('./database');

var _express = require('express'); var _express2 = _interopRequireDefault(_express);
var _homeRoutes = require('./routes/homeRoutes'); var _homeRoutes2 = _interopRequireDefault(_homeRoutes);
var _entityRoutes = require('./routes/entityRoutes'); var _entityRoutes2 = _interopRequireDefault(_entityRoutes);
var _workOrderRoutes = require('./routes/workOrderRoutes'); var _workOrderRoutes2 = _interopRequireDefault(_workOrderRoutes);
var _tokenRoutes = require('./routes/tokenRoutes'); var _tokenRoutes2 = _interopRequireDefault(_tokenRoutes);
var _itemRoutes = require('./routes/itemRoutes'); var _itemRoutes2 = _interopRequireDefault(_itemRoutes);
var _transactionRoutes = require('./routes/transactionRoutes'); var _transactionRoutes2 = _interopRequireDefault(_transactionRoutes);
var _transactionItemRoutes = require('./routes/transactionItemRoutes'); var _transactionItemRoutes2 = _interopRequireDefault(_transactionItemRoutes);
var _regionsRoutes = require('./routes/regionsRoutes'); var _regionsRoutes2 = _interopRequireDefault(_regionsRoutes);
var _categoryRoutes = require('./routes/categoryRoutes'); var _categoryRoutes2 = _interopRequireDefault(_categoryRoutes);
var _typeServOrdRoutes = require('./routes/typeServOrdRoutes'); var _typeServOrdRoutes2 = _interopRequireDefault(_typeServOrdRoutes);
var _typeAssistanceRoutes = require('./routes/typeAssistanceRoutes'); var _typeAssistanceRoutes2 = _interopRequireDefault(_typeAssistanceRoutes);
var _productRoutes = require('./routes/productRoutes'); var _productRoutes2 = _interopRequireDefault(_productRoutes);
var _citiesRoutes = require('./routes/citiesRoutes'); var _citiesRoutes2 = _interopRequireDefault(_citiesRoutes);
var _streetTypeRoutes = require('./routes/streetTypeRoutes'); var _streetTypeRoutes2 = _interopRequireDefault(_streetTypeRoutes);

const whiteList = [
  'http://localhost:8080',
  'https://app.conabplus.com.br',
  'https://staging.conabplus.com.br',
  'https://sb.conabbombas.com.br'
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
  }

  middlewares() {
    this.app.use(_cors2.default.call(void 0, corsOptions));
    // this.app.use(helmet());
    this.app.use(_express2.default.urlencoded({ extended: true }));
    this.app.use(_express2.default.json());
    // this.app.use('/images/', express.static(resolve(__dirname, '..', 'uploads', 'images')));
  }
//
  routes() {
    this.app.use('/', _homeRoutes2.default);
    this.app.use('/entities/', _entityRoutes2.default);
    this.app.use('/work-orders/', _workOrderRoutes2.default);
    this.app.use('/tokens/', _tokenRoutes2.default);
    this.app.use('/api/', _regionsRoutes2.default);
    this.app.use('/api/', _categoryRoutes2.default);
    this.app.use('/types-serv-ord/', _typeServOrdRoutes2.default);
    this.app.use('/types-assistance/', _typeAssistanceRoutes2.default);
    this.app.use('/products/', _productRoutes2.default);
    this.app.use('/cities/', _citiesRoutes2.default);
    this.app.use('/street-types/', _streetTypeRoutes2.default);

    //this.app.use('/transactions/', transactionRoutes);
    //this.app.use('/items/', itemRoutes);
    //this.app.use('/transactions/items/', transactionItemRoutes);
  }
}

exports. default = new App().app;
