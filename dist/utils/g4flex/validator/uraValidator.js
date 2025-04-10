"use strict";Object.defineProperty(exports, "__esModule", {value: true});// utils/validators/contractValidator.js

 function validateURAQuery({ cpf, cnpj, customerId, uraRequestId }) {
  if (!uraRequestId) return 'URA request ID is required';
  if (!customerId && !cpf && !cnpj) return 'Customer identification is required';
  if (customerId && (cpf || cnpj)) return 'Customer ID, CPF, or CNPJ cannot be provided simultaneously';
  if (cpf && cnpj) return 'CPF and CNPJ cannot be provided simultaneously';
  if (customerId && customerId.length >= 8) return 'Customer ID must be equal or less than 7 characters';
  return null;
} exports.validateURAQuery = validateURAQuery;
