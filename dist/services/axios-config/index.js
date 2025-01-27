"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// axios-config

var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _interceptors = require('./interceptors');
// import { Environment } from '../../../environment';

const Api = _axios2.default.create({
  // baseURL: Environment.URL_BASE,
  baseURL: 'https://erpteste.conab.com.br:7211',
  headers: {
    'Content-Type': 'application/json',
    'Riosoft-Token': 'token-do-erp'
  }
});

Api.interceptors.response.use(
  (response) => _interceptors.responseInterceptor.call(void 0, response),
  (error) => _interceptors.errorInterceptor.call(void 0, error),
);

exports.Api = Api;
