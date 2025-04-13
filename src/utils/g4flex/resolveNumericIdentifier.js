// utils/g4flex/resolveNumericIdentifier.ts
import { determineIdentifierType } from './validator/uraValidator';

export function resolveNumericIdentifier(identifier) {
  const type = determineIdentifierType(identifier);
  const numeric = identifier.replace(/\D/g, '');

  if (type === 'CPF') return { cpf: numeric };
  if (type === 'CNPJ') return { cnpj: numeric };
  if (type === 'CUSTOMER_ID') return { customerId: numeric.padStart(7, '0') };

  throw new Error('Invalid customer identifier format');
}
