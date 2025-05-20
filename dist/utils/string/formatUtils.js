"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _cpfcnpjvalidator = require('cpf-cnpj-validator');

function onlyDigits(value) {
  return value.toString().replace(/\D/g, '');
}

 function normalizeName(name) {
  if (!name) return '';

  // Substitui pontos por espaços e remove espaços extras
  const cleanName = name.replace(/\./g, ' ').trim().replace(/\s+/g, ' ');

  // Converte para lowercase e depois capitaliza cada palavra
  return cleanName
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
} exports.normalizeName = normalizeName;

 function formatCPF(cpfValue) {
  if (!cpfValue) return null;

  const clean = onlyDigits(cpfValue);

  if (clean.length !== 11) return null;

  return _cpfcnpjvalidator.cpf.isValid(clean) ? clean : null;
} exports.formatCPF = formatCPF;

 function formatCNPJ(cnpjValue) {
  if (!cnpjValue) return null;

  const clean = onlyDigits(cnpjValue);

  if (clean.length !== 14) return null;

  return _cpfcnpjvalidator.cnpj.isValid(clean) ? clean : null;
} exports.formatCNPJ = formatCNPJ;

 function formatCustomerId(customerId) {
  if (!customerId) return null;

  const clean = onlyDigits(customerId);

  return clean.padStart(7, '0');
} exports.formatCustomerId = formatCustomerId;
