const redis = require('../../../config/redis');
const generateURAIdempotencyKey = require('../utils/generateURAIdempotencyKey');

/**
 * Middleware para prevenir requisições duplicadas da URA
 * Verifica se uma requisição idêntica já foi processada dentro do TTL configurado
 */
module.exports = async function preventDuplicateURARequest(req, res, next) {
  const { idURA, tipoRequisicao } = req.body;

  // Validação básica dos parâmetros necessários
  if (!idURA || !tipoRequisicao) {
    return res.status(400).json({
      success: false,
      error: 'idURA e tipoRequisicao são obrigatórios para o controle de idempotência'
    });
  }

  try {
    // Gera a chave única para esta requisição específica
    const redisKey = generateURAIdempotencyKey(idURA, tipoRequisicao, req.body);

    // Verifica se essa requisição já foi processada
    const exists = await redis.get(redisKey);
    if (exists) {
      return res.status(409).json({
        success: false,
        error: 'Requisição duplicada detectada para esta sessão URA e tipo de operação'
      });
    }

    // TTL em segundos (10 minutos por padrão, ajustável via variável de ambiente)
    const ttl = process.env.URA_REQUEST_TTL || 600;

    // Armazena a chave no Redis com TTL para evitar duplicações
    await redis.set(redisKey, 'processado', 'EX', ttl);

    // Continua para o próximo middleware ou controller
    next();
  } catch (error) {
    console.error('Erro ao verificar idempotência da requisição URA:', error);

    // Em caso de erro na verificação, permitimos que a requisição prossiga
    // para não bloquear o fluxo por falha no Redis
    next();
  }
};
