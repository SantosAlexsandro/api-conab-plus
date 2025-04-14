// Middleware global para tratamento de erros
export default (err, req, res, next) => {
  // Log do erro para debugging (em produção, usar um sistema de log mais robusto)
  console.error(err);

  // Verificar o tipo de erro e formatar a resposta adequadamente
  if (err.name === 'SequelizeValidationError') {
    // Erros de validação do Sequelize
    return res.status(400).json({
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    // Erros de unicidade do Sequelize
    return res.status(409).json({
      errors: err.errors.map((e) => ({
        field: e.path,
        message: 'Este valor já está em uso',
      })),
    });
  }

  // Erros de validação do express-validator
  if (err.isValidationError) {
    return res.status(400).json({
      error: err.message,
      validationErrors: err.details.validationErrors,
    });
  }

  // Para erros 409 (Conflict) personalizados
  if (err.statusCode === 409) {
    return res.status(409).json({
      error: err.message,
      details: err.details || null,
    });
  }

  // Erros 404 (Not Found)
  if (err.statusCode === 404) {
    return res.status(404).json({
      error: err.message,
    });
  }

  // Erros 400 (Bad Request)
  if (err.statusCode === 400) {
    return res.status(400).json({
      error: err.message,
      details: err.details || null,
    });
  }

  // Erro padrão - interno do servidor
  return res.status(500).json({
    error: 'Erro interno do servidor',
  });
};
