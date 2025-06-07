// src/integrations/g4flex/services/ContractService.js
import BaseERPService from './BaseERPService';
import customerService from './CustomerService';
import logEvent from '../../../utils/logEvent';
import { resolveNumericIdentifier } from '../utils/resolveNumericIdentifier';

class ContractService extends BaseERPService {
  constructor() {
    super();
    // console.log('[ContractService G4Flex] 🏗️ Instância criada');
    // console.log('[ContractService G4Flex] 🔗 Token disponível:', !!this.token);
    // console.log('[ContractService G4Flex] 🔑 Token (primeiros 10 chars):', this.token?.substring(0, 10) + '...');
  }

  async checkActiveContract(cpf, cnpj, customerId, uraRequestId) {
    try {
      // console.log('[ContractService G4Flex] 🔍 Iniciando verificação de contrato ativo');
      // console.log('[ContractService G4Flex] 📋 Parâmetros:', {
      //   cpf: cpf ? `${cpf.substring(0, 3)}...` : null,
      //   cnpj: cnpj ? `${cnpj.substring(0, 2)}...` : null,
      //   customerId,
      //   uraRequestId
      // });

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

      // console.log('[ContractService G4Flex] 🎯 Identificador determinado:', { identifierType, identifierValue });

      // Busca dados do cliente usando o método unificado
      const customerData = await customerService.getCustomerByIdentifier(identifierType, identifierValue);
      const finalCustomerId = customerData.codigo;
      const customerName = customerData.nome;

      // console.log('[ContractService G4Flex] 👤 Cliente encontrado:', { finalCustomerId, customerName });

      const contractUrl = `/api/Contrato/RetrievePage?filter=(Status='Ativo'or Status='Suspenso Faturamento') and ContratoPagRec='REC' and CodigoEntidade='${finalCustomerId}'&order&pageSize=200&pageIndex=1`;

      // console.log('[ContractService G4Flex] 📞 Fazendo requisição de contrato para ERP');
      // console.log('[ContractService G4Flex] 🔗 URL:', contractUrl);
      // console.log('[ContractService G4Flex] 🔑 Token sendo usado (primeiros 10 chars):', this.token?.substring(0, 10) + '...');
      // console.log('[ContractService G4Flex] 🌐 Base URL:', this.apiUrl);

      const contractResponse = await this.axiosInstance.get(contractUrl);

      // console.log('[ContractService G4Flex] ✅ Resposta do contrato recebida');
      // console.log('[ContractService G4Flex] 📊 Contratos encontrados:', contractResponse.data?.length || 0);

      const responseData = {
        customerId: finalCustomerId,
        hasActiveContract: this.validateActiveContract(contractResponse.data),
        customerName
      };

      // console.log('[ContractService G4Flex] 🎯 Resultado final:', responseData);

      return responseData;
    } catch (error) {
      console.error('[ContractService G4Flex] ❌ Erro na verificação de contrato:', error.message);
      if (error.response?.data?.Message) {
        console.error('[ContractService G4Flex] 📝 Mensagem do ERP:', error.response.data.Message);
      }
      // Propaga o erro original com status code
      throw error;
    }
  }

  validateActiveContract(contractData) {
    const isValid = contractData && contractData.length > 0;
    // console.log('[ContractService G4Flex] ✅ Validação de contrato:', isValid);
    return isValid;
  }

  async getActiveContract(customerId) {
    // console.log('[ContractService G4Flex] 🔍 Buscando contrato ativo para cliente:', customerId);
    // console.log('[ContractService G4Flex] 🔑 Token sendo usado (primeiros 10 chars):', this.token?.substring(0, 10) + '...');

    const contractUrl = `/api/Contrato/RetrievePage?filter=(Status='Ativo' or Status='Suspenso Faturamento') and ContratoPagRec='REC' and CodigoEntidade='${customerId}'&order&pageSize=200&pageIndex=1`;
    // console.log('[ContractService G4Flex] 🔗 URL:', contractUrl);

    const response = await this.axiosInstance.get(contractUrl);

    // console.log('[ContractService G4Flex] 📊 Contratos ativos encontrados:', response.data?.length || 0);
    // if (response.data?.length > 0) {
    //   console.log('[ContractService G4Flex] 📋 Primeiro contrato:', {
    //     numero: response.data[0]?.Numero,
    //     status: response.data[0]?.Status
    //   });
    // }

    return response.data[0];
  }

}

export default new ContractService();
