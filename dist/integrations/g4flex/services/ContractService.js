"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// src/integrations/g4flex/services/ContractService.js
var _BaseERPService = require('./BaseERPService'); var _BaseERPService2 = _interopRequireDefault(_BaseERPService);
var _CustomerService = require('./CustomerService'); var _CustomerService2 = _interopRequireDefault(_CustomerService);
var _logEvent = require('../../../utils/logEvent'); var _logEvent2 = _interopRequireDefault(_logEvent);
var _resolveNumericIdentifier = require('../utils/resolveNumericIdentifier');

class ContractService extends _BaseERPService2.default {
  constructor() {
    super();
    console.log('[ContractService G4Flex] 🏗️ Instância criada');
    console.log('[ContractService G4Flex] 🔗 Token disponível:', !!this.token);
    console.log('[ContractService G4Flex] 🔑 Token (primeiros 10 chars):', _optionalChain([this, 'access', _ => _.token, 'optionalAccess', _2 => _2.substring, 'call', _3 => _3(0, 10)]) + '...');
  }

  async checkActiveContract(cpf, cnpj, customerId, uraRequestId) {
    try {
      console.log('[ContractService G4Flex] 🔍 Iniciando verificação de contrato ativo');
      console.log('[ContractService G4Flex] 📋 Parâmetros:', {
        cpf: cpf ? `${cpf.substring(0, 3)}...` : null,
        cnpj: cnpj ? `${cnpj.substring(0, 2)}...` : null,
        customerId,
        uraRequestId
      });

      // Determina o tipo e valor do identificador
      let identifierType, identifierValue;

      if (customerId) {
        identifierType = 'customerId';
        identifierValue = customerId;
      } else if (cpf) {
        identifierType = 'cpf';
        identifierValue = cpf;
      } else if (cnpj) {
        identifierType = 'cnpj';
        identifierValue = cnpj;
      } else {
        throw new Error('Nenhum identificador fornecido (CPF, CNPJ ou customerId)');
      }

      console.log('[ContractService G4Flex] 🎯 Identificador determinado:', { identifierType, identifierValue });

      // Busca dados do cliente usando o método unificado
      const customerData = await _CustomerService2.default.getCustomerByIdentifier(identifierType, identifierValue);
      const finalCustomerId = customerData.codigo;
      const customerName = customerData.nome;

      console.log('[ContractService G4Flex] 👤 Cliente encontrado:', { finalCustomerId, customerName });

      const contractUrl = `/api/Contrato/RetrievePage?filter=(Status='Ativo'or Status='Suspenso Faturamento') and ContratoPagRec='REC' and CodigoEntidade='${finalCustomerId}'&order&pageSize=200&pageIndex=1`;

      console.log('[ContractService G4Flex] 📞 Fazendo requisição de contrato para ERP');
      console.log('[ContractService G4Flex] 🔗 URL:', contractUrl);
      console.log('[ContractService G4Flex] 🔑 Token sendo usado (primeiros 10 chars):', _optionalChain([this, 'access', _4 => _4.token, 'optionalAccess', _5 => _5.substring, 'call', _6 => _6(0, 10)]) + '...');
      console.log('[ContractService G4Flex] 🌐 Base URL:', this.apiUrl);

      const contractResponse = await this.axiosInstance.get(contractUrl);

      console.log('[ContractService G4Flex] ✅ Resposta do contrato recebida');
      console.log('[ContractService G4Flex] 📊 Contratos encontrados:', _optionalChain([contractResponse, 'access', _7 => _7.data, 'optionalAccess', _8 => _8.length]) || 0);

      const responseData = {
        customerId: finalCustomerId,
        hasActiveContract: this.validateActiveContract(contractResponse.data),
        customerName
      };

      console.log('[ContractService G4Flex] 🎯 Resultado final:', responseData);

      return responseData;
    } catch (error) {
      console.error('[ContractService G4Flex] ❌ Erro na verificação de contrato:', error.message);
      if (_optionalChain([error, 'access', _9 => _9.response, 'optionalAccess', _10 => _10.data, 'optionalAccess', _11 => _11.Message])) {
        console.error('[ContractService G4Flex] 📝 Mensagem do ERP:', error.response.data.Message);
      }
      // Propaga o erro original com status code
      throw error;
    }
  }

  validateActiveContract(contractData) {
    const isValid = contractData && contractData.length > 0;
    console.log('[ContractService G4Flex] ✅ Validação de contrato:', isValid);
    return isValid;
  }

  async getActiveContract(customerId) {
    console.log('[ContractService G4Flex] 🔍 Buscando contrato ativo para cliente:', customerId);
    console.log('[ContractService G4Flex] 🔑 Token sendo usado (primeiros 10 chars):', _optionalChain([this, 'access', _12 => _12.token, 'optionalAccess', _13 => _13.substring, 'call', _14 => _14(0, 10)]) + '...');

    const contractUrl = `/api/Contrato/RetrievePage?filter=(Status='Ativo' or Status='Suspenso Faturamento') and ContratoPagRec='REC' and CodigoEntidade='${customerId}'&order&pageSize=200&pageIndex=1`;
    console.log('[ContractService G4Flex] 🔗 URL:', contractUrl);

    const response = await this.axiosInstance.get(contractUrl);

    console.log('[ContractService G4Flex] 📊 Contratos ativos encontrados:', _optionalChain([response, 'access', _15 => _15.data, 'optionalAccess', _16 => _16.length]) || 0);
    if (_optionalChain([response, 'access', _17 => _17.data, 'optionalAccess', _18 => _18.length]) > 0) {
      console.log('[ContractService G4Flex] 📋 Primeiro contrato:', {
        numero: _optionalChain([response, 'access', _19 => _19.data, 'access', _20 => _20[0], 'optionalAccess', _21 => _21.Numero]),
        status: _optionalChain([response, 'access', _22 => _22.data, 'access', _23 => _23[0], 'optionalAccess', _24 => _24.Status])
      });
    }

    return response.data[0];
  }

}

exports. default = new ContractService();
