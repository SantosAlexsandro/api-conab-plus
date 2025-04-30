import BaseG4FlexService from './BaseG4FlexService';

class EntityService extends BaseG4FlexService {
  constructor() {
    super();
  }

  /**
   * Método genérico para buscar cliente por diferentes tipos de filtro
   */
  async getCustomerByFilter(filterField, filterValue, errorMessage) {
    try {
      if (!filterValue) {
        throw new Error(errorMessage || `Filter value for ${filterField} not provided`);
      }

      const response = await this.axiosInstance.get(
        `/api/Entidade/RetrievePage?filter=${filterField}=${filterValue}&order=&pageSize=10&pageIndex=1`
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

  /**
   * Busca cliente usando o tipo de identificador e seu valor
   */
  async getCustomerByIdentifier(identifierType, identifierValue) {
    if (!identifierType || !identifierValue) {
      throw new Error('Tipo de identificador ou valor não fornecido');
    }

    // Define o campo e mensagem de erro com base no tipo de identificador
    const filterConfig = {
      'customerId': {
        field: 'Codigo',
        errorMessage: 'Customer ID not provided'
      },
      'cpf': {
        field: 'CPFCNPJ',
        errorMessage: 'CPF not provided'
      },
      'cnpj': {
        field: 'CPFCNPJ',
        errorMessage: 'CNPJ not provided'
      }
    };

    const config = filterConfig[identifierType];
    if (!config) {
      throw new Error(`Tipo de identificador inválido: ${identifierType}`);
    }

    return this.getCustomerByFilter(config.field, identifierValue, config.errorMessage);
  }
}

export default new EntityService();
