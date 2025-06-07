"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _EntityServicejs = require('../../../services/EntityService.js'); var _EntityServicejs2 = _interopRequireDefault(_EntityServicejs);

class CustomerService {
  constructor() {
    // Usa a instância do EntityService principal
    this.erpEntityService = _EntityServicejs2.default;
    // console.log('[CustomerService G4Flex] 🏗️ Instância criada, usando EntityService principal');
  }

  /**
   * Busca cliente usando o tipo de identificador e seu valor
   */
  async getCustomerByIdentifier(identifierType, identifierValue) {
    // console.log('[CustomerService G4Flex] 🔍 Buscando cliente por identificador');
    // console.log('[CustomerService G4Flex] 📋 Parâmetros:', {
    //   identifierType,
    //   identifierValue: identifierValue ? `${identifierValue.toString().substring(0, 3)}...` : null
    // });

    if (!identifierType || !identifierValue) {
      throw new Error('Tipo de identificador ou valor não fornecido');
    }

    // Define o campo com base no tipo de identificador
    const filterConfig = {
      'customerId': 'Codigo',
      'cpf': 'CPFCNPJ',
      'cnpj': 'CPFCNPJ'
    };

    const fieldName = filterConfig[identifierType];
    if (!fieldName) {
      throw new Error(`Tipo de identificador inválido: ${identifierType}`);
    }

    // console.log('[CustomerService G4Flex] 🎯 Campo de busca determinado:', fieldName);
    // console.log('[CustomerService G4Flex] 📞 Chamando EntityService.getEntityByProperty...');

    // Usa o método do EntityService principal
    const result = await this.erpEntityService.getEntityByProperty(fieldName, identifierValue);

    // console.log('[CustomerService G4Flex] ✅ Resposta do EntityService recebida');
    // console.log('[CustomerService G4Flex] 📊 Entidades encontradas:', result.data?.length || 0);

    // Adapta o retorno para o formato esperado pelo G4Flex
    if (result.data && result.data.length > 0) {
      const customer = {
        codigo: result.data[0].Codigo,
        nome: result.data[0].Nome
      };

      // console.log('[CustomerService G4Flex] 👤 Cliente encontrado:', {
      //   codigo: customer.codigo,
      //   nome: customer.nome
      // });

      return customer;
    }

    // console.log('[CustomerService G4Flex] ❌ Cliente não encontrado');
    throw { status: 404, message: 'Customer not found' };
  }
}

exports. default = new CustomerService();
