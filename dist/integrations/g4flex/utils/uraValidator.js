"use strict";Object.defineProperty(exports, "__esModule", {value: true});// utils/validators/contractValidator.js
var _formatUtils = require('../../../utils/string/formatUtils');

 function validateURAQuery({ customerIdentifier, uraRequestId }) {
  if (!uraRequestId) return 'URA request ID is required';
  if (!customerIdentifier) return 'Customer identification is required';

  // Remove caracteres não numéricos para verificação
  const numericIdentifier = customerIdentifier.replace(/\D/g, '');

  // CPF tem 11 dígitos
  if (numericIdentifier.length === 11 && !_formatUtils.formatCPF.call(void 0, customerIdentifier)) {
    return 'Invalid CPF';
  }
  console.log('numericIdentifier', numericIdentifier);

  // CNPJ tem 14 dígitos
  if (numericIdentifier.length === 14 && !_formatUtils.formatCNPJ.call(void 0, customerIdentifier)) {
    return 'Invalid CNPJ';
  }

  // ID do cliente normalmente tem menos de 8 caracteres
  if (numericIdentifier.length < 8 && !_formatUtils.formatCustomerId.call(void 0, customerIdentifier)) {
    return 'Invalid Customer ID';
  }

  return null;
} exports.validateURAQuery = validateURAQuery;

// Função para determinar o tipo de identificador do cliente
 function determineIdentifierType(identifier) {
  if (!identifier) return null;

  // Remove caracteres não numéricos para verificação
  const numericIdentifier = identifier.replace(/\D/g, '');

  // CPF tem 11 dígitos
  if (numericIdentifier.length === 11) {
    return 'CPF';
  }
  console.log('numericIdentifier', numericIdentifier);

  // CNPJ tem 14 dígitos
  if (numericIdentifier.length === 14) {
    return 'CNPJ';
  }

  // ID do cliente normalmente tem menos de 8 caracteres
  if (identifier.length < 8) {
    return 'CUSTOMER_ID';
  }

  return null;
} exports.determineIdentifierType = determineIdentifierType;
