"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _BaseG4FlexService = require('./BaseG4FlexService'); var _BaseG4FlexService2 = _interopRequireDefault(_BaseG4FlexService);

class EntityService extends _BaseG4FlexService2.default {
  constructor() {
    super();
  }

  async getCustomerData(document) {
    try {
      if (!document) {
        throw new Error('Document (CPF/CNPJ) not provided');
      }

      const response = await this.axiosInstance.get(
        `/api/Entidade/RetrievePage?filter=CPFCNPJ=${document}&order=&pageSize=10&pageIndex=1`
      );

      if (!response.data || response.data.length === 0) {
        throw { status: 404, message: 'Customer not found' };
      }

      return {
        codigo: response.data[0].Codigo,
        nome: response.data[0].Nome
      };

    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getCustomerDataById(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID not provided');
      }

      const response = await this.axiosInstance.get(
        `/api/Entidade/RetrievePage?filter=Codigo=${customerId}&order=&pageSize=10&pageIndex=1`
      );

      if (!response.data || response.data.length === 0) {
        throw { status: 404, message: 'Customer not found' };
      }

      return {
        codigo: response.data[0].Codigo,
        nome: response.data[0].Nome
      };

    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
}

exports. default = new EntityService();
