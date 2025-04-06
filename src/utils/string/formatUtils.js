import { cpf, cnpj } from 'cpf-cnpj-validator';

function onlyDigits(value) {
  return value.toString().replace(/\D/g, '');
}

export function formatCPF(cpfValue) {
  if (!cpfValue) return null;

  const clean = onlyDigits(cpfValue);

  if (clean.length !== 11) return null;

  return cpf.isValid(clean) ? clean : null;
}

export function formatCNPJ(cnpjValue) {
  if (!cnpjValue) return null;

  const clean = onlyDigits(cnpjValue);

  if (clean.length !== 14) return null;

  return cnpj.isValid(clean) ? clean : null;
}

export function formatCustomerId(customerId) {
  if (!customerId) return null;

  const clean = onlyDigits(customerId);

  return clean.padStart(7, '0');
}
