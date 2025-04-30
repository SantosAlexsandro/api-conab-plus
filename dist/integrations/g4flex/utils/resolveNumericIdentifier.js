"use strict";Object.defineProperty(exports, "__esModule", {value: true});// utils/g4flex/resolveNumericIdentifier.ts
var _uraValidator = require('./uraValidator');

 function resolveNumericIdentifier(identifier = "") {
  // Remove caracteres não numéricos
  const numericValue = identifier.replace(/\D/g, '');

  // Valida CPF (11 dígitos)
  if (/^\d{11}$/.test(numericValue)) {
    return { identifierType: 'cpf', identifierValue: numericValue };
  }

  // Valida CNPJ (14 dígitos)
  if (/^\d{14}$/.test(numericValue)) {
    return { identifierType: 'cnpj', identifierValue: numericValue };
  }

  // Valida ID do cliente (entre 1 e 7 dígitos)
  if (/^\d{1,7}$/.test(numericValue)) {
    return {
      identifierType: 'customerId',
      identifierValue: numericValue.padStart(7, '0')
    };
  }

  // Caso nenhum padrão seja identificado
  throw new Error('Formato de identificador inválido');
} exports.resolveNumericIdentifier = resolveNumericIdentifier;
