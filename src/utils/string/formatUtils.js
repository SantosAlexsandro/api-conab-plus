import { cpf, cnpj } from 'cpf-cnpj-validator';

export function formatCPF(cpfValue) {
  if (!cpfValue) return null;

  const clean = cpfValue.replace(/[^\d]/g, '');

  if (clean.length !== 11) {
    throw new Error('CPF must contain 11 digits');
  }

  return cpf.isValid(clean) ? clean : null;
}

export function formatCNPJ(cnpjValue) {
  if (!cnpjValue) return null;

  const clean = cnpjValue.replace(/[^\d]/g, '');

  if (clean.length !== 14) {
    throw new Error('CNPJ must contain 14 digits');
  }

  return cnpj.isValid(clean) ? clean : null;
}

export function formatCustomerId(customerId) {
  if (!customerId) return null;

  const clean = customerId.replace(/[^\d]/g, '');
  console.log('clean', clean);
  return clean.padStart(7, '0');
}