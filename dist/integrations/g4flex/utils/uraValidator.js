"use strict";Object.defineProperty(exports, "__esModule", {value: true});// utils/validators/contractValidator.js
var _formatUtils = require('../../../utils/string/formatUtils');

 function validateURAQuery({ customerIdentifier, uraRequestId }) {
  if (!uraRequestId) return 'URA request ID is required';
  if (!customerIdentifier) return 'Customer identification is required';

  // Remove caracteres não numéricos para verificação
  const numericIdentifier = customerIdentifier.replace(/\D/g, '');

  // CPF tem 11 dígitos
  if (numericIdentifier.length === 11) {
    if (!_formatUtils.formatCPF.call(void 0, customerIdentifier)) {
      return 'Invalid CPF';
    }
    return null; // CPF válido
  }

  // CNPJ tem 14 dígitos
  if (numericIdentifier.length === 14) {
    if (!_formatUtils.formatCNPJ.call(void 0, customerIdentifier)) {
      return 'Invalid CNPJ';
    }
    return null; // CNPJ válido
  }

  // ID do cliente normalmente tem entre 1 e 7 dígitos
  if (numericIdentifier.length >= 1 && numericIdentifier.length <= 7) {
    // Customer ID é sempre válido se estiver no range correto
    return null; // Customer ID válido
  }

  // Se não corresponde a nenhum formato conhecido
  return 'Invalid customer identifier format';
} exports.validateURAQuery = validateURAQuery;

// Validação específica para falhas da URA - customerIdentifier é opcional
 function validateURAFailureQuery({ customerIdentifier, uraRequestId }) {
  if (!uraRequestId) return 'URA request ID is required';

  // Se customerIdentifier for fornecido, valida o formato
  if (customerIdentifier) {
    // Remove caracteres não numéricos para verificação
    const numericIdentifier = customerIdentifier.replace(/\D/g, '');

    // CPF tem 11 dígitos
    if (numericIdentifier.length === 11) {
      if (!_formatUtils.formatCPF.call(void 0, customerIdentifier)) {
        return 'Invalid CPF';
      }
      return null; // CPF válido
    }

    // CNPJ tem 14 dígitos
    if (numericIdentifier.length === 14) {
      if (!_formatUtils.formatCNPJ.call(void 0, customerIdentifier)) {
        return 'Invalid CNPJ';
      }
      return null; // CNPJ válido
    }

    // ID do cliente normalmente tem entre 1 e 7 dígitos
    if (numericIdentifier.length >= 1 && numericIdentifier.length <= 7) {
      // Customer ID é sempre válido se estiver no range correto
      return null; // Customer ID válido
    }

    // Se não corresponde a nenhum formato conhecido
    return 'Invalid customer identifier format';
  }

  return null;
} exports.validateURAFailureQuery = validateURAFailureQuery;

// Função para determinar o tipo de identificador do cliente
 function determineIdentifierType(identifier) {
  if (!identifier) return null;

  // Remove caracteres não numéricos para verificação
  const numericIdentifier = identifier.replace(/\D/g, '');

  // CPF tem 11 dígitos
  if (numericIdentifier.length === 11) {
    return 'CPF';
  }

  // CNPJ tem 14 dígitos
  if (numericIdentifier.length === 14) {
    return 'CNPJ';
  }

  // ID do cliente normalmente tem entre 1 e 7 dígitos
  if (numericIdentifier.length >= 1 && numericIdentifier.length <= 7) {
    return 'CUSTOMER_ID';
  }

  return null;
} exports.determineIdentifierType = determineIdentifierType;
