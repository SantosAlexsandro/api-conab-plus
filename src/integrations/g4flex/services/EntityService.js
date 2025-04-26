import BaseG4FlexService from './BaseG4FlexService';

class EntityService extends BaseG4FlexService {
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

export default new EntityService();
