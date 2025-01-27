// axios-config

import axios from 'axios';
import { responseInterceptor, errorInterceptor } from './interceptors';
// import { Environment } from '../../../environment';

const Api = axios.create({
  // baseURL: Environment.URL_BASE,
  baseURL: 'https://erpteste.conab.com.br:7211',
  headers: {
    'Content-Type': 'application/json',
    'Riosoft-Token': 'token-do-erp'
  }
});

Api.interceptors.response.use(
  (response) => responseInterceptor(response),
  (error) => errorInterceptor(error),
);

export { Api };
