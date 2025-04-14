import { validationResult } from 'express-validator';

export default (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Formatar os erros de uma maneira mais detalhada e padronizada
    const validationErrors = errors.array().map((error) => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    // Criar um erro com formato compatível com errorHandler
    const error = new Error('Erro de validação');
    error.statusCode = 400;
    error.details = { validationErrors };
    error.isValidationError = true;

    return next(error);
  }

  return next();
};
