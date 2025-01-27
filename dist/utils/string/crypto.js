"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);

// Chave secreta para criptografia (armazene em variáveis de ambiente)
const SECRET_KEY = process.env.CRYPTO_SECRET_KEY;

// Função para criptografar a senha
 const encryptPassword = (password) => {
  const cipher = _crypto2.default.createCipheriv('aes-256-ctr', SECRET_KEY, Buffer.alloc(16, 0));
  return cipher.update(password, 'utf8', 'hex') + cipher.final('hex');
}; exports.encryptPassword = encryptPassword;

// Função para descriptografar a senha
 const decryptPassword = (encryptedPassword) => {
  const decipher = _crypto2.default.createDecipheriv('aes-256-ctr', SECRET_KEY, Buffer.alloc(16, 0));
  return decipher.update(encryptedPassword, 'hex', 'utf8') + decipher.final('utf8');
}; exports.decryptPassword = decryptPassword;
