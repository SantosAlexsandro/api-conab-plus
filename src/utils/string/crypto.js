import crypto from 'crypto';

// Chave secreta para criptografia (armazene em variáveis de ambiente)
const SECRET_KEY = process.env.CRYPTO_SECRET_KEY;

// Função para criptografar a senha
export const encryptPassword = (password) => {
  const cipher = crypto.createCipheriv('aes-256-ctr', SECRET_KEY, Buffer.alloc(16, 0));
  return cipher.update(password, 'utf8', 'hex') + cipher.final('hex');
};

// Função para descriptografar a senha
export const decryptPassword = (encryptedPassword) => {
  const decipher = crypto.createDecipheriv('aes-256-ctr', SECRET_KEY, Buffer.alloc(16, 0));
  return decipher.update(encryptedPassword, 'hex', 'utf8') + decipher.final('utf8');
};
