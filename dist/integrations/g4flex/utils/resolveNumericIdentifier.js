"use strict";Object.defineProperty(exports, "__esModule", {value: true});// utils/g4flex/resolveNumericIdentifier.ts
var _uraValidator = require('./uraValidator');

 function resolveNumericIdentifier(identifier) {
  const type = _uraValidator.determineIdentifierType.call(void 0, identifier);
  const numeric = identifier.replace(/\D/g, '');

  if (type === 'CPF') return { cpf: numeric };
  if (type === 'CNPJ') return { cnpj: numeric };
  if (type === 'CUSTOMER_ID') return { customerId: numeric.padStart(7, '0') };

  throw new Error('Invalid customer identifier format');
} exports.resolveNumericIdentifier = resolveNumericIdentifier;
