const crypto = require('crypto');

/**
 * Gera uma chave Redis única para controle de idempotência de requisições URA.
 * Considera a combinação de idURA (sessão/ligação), tipo de requisição e conteúdo do payload.
 *
 * @param {string} idURA - ID da sessão/ligação URA
 * @param {string} tipoRequisicao - Tipo da requisição: criar-os, cancelar-os, etc
 * @param {object} body - Payload da requisição (para gerar hash)
 * @returns {string} - Chave única para armazenar no Redis
 */
function generateURAIdempotencyKey(idURA, tipoRequisicao, body) {
  // Cria um hash SHA-256 do corpo da requisição para identificar unicamente o conteúdo
  const payloadHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(body))
    .digest('hex');

  // Formata a chave Redis combinando todos os elementos que identificam unicamente a requisição
  return `ura:request:${idURA}:${tipoRequisicao}:${payloadHash}`;
}

module.exports = generateURAIdempotencyKey;
