"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _dotenv = require('dotenv'); var _dotenv2 = _interopRequireDefault(_dotenv);
var _path = require('path');
var _cors = require('cors'); var _cors2 = _interopRequireDefault(_cors);
// import helmet from 'helmet';

_dotenv2.default.config();

require('./database');

var _express = require('express'); var _express2 = _interopRequireDefault(_express);
var _homeRoutes = require('./routes/homeRoutes'); var _homeRoutes2 = _interopRequireDefault(_homeRoutes);
var _entityRoutes = require('./routes/entityRoutes'); var _entityRoutes2 = _interopRequireDefault(_entityRoutes);
var _tokenRoutes = require('./routes/tokenRoutes'); var _tokenRoutes2 = _interopRequireDefault(_tokenRoutes);
var _itemRoutes = require('./routes/itemRoutes'); var _itemRoutes2 = _interopRequireDefault(_itemRoutes);
var _transactionRoutes = require('./routes/transactionRoutes'); var _transactionRoutes2 = _interopRequireDefault(_transactionRoutes);
var _transactionItemRoutes = require('./routes/transactionItemRoutes'); var _transactionItemRoutes2 = _interopRequireDefault(_transactionItemRoutes);
var _RegionsRoutes = require('./routes/RegionsRoutes'); var _RegionsRoutes2 = _interopRequireDefault(_RegionsRoutes);

const whiteList = [
  'http://localhost:8080',
  'https://app.conabbombas.com.br'
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

  routes() {
    this.app.use('/', _homeRoutes2.default);
    this.app.use('/entidades/', _entityRoutes2.default);
    this.app.use('/tokens/', _tokenRoutes2.default);
    this.app.use('/api/', _RegionsRoutes2.default);
    //this.app.use('/transactions/', transactionRoutes);
    //this.app.use('/items/', itemRoutes);
    //this.app.use('/transactions/items/', transactionItemRoutes);
  }
}

exports. default = new App().app;