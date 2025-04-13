import { body, param, query } from 'express-validator';

export class WorkShiftValidator {
  static validateStore() {
    return [
      body('user_code')
        .notEmpty()
        .withMessage('Código do usuário é obrigatório')
        .isString()
        .withMessage('Código do usuário deve ser uma string'),

      body('start_time')
        .notEmpty()
        .withMessage('Horário inicial é obrigatório')
        .isISO8601()
        .withMessage('Horário inicial deve ser uma data válida'),

      body('end_time')
        .notEmpty()
        .withMessage('Horário final é obrigatório')
        .isISO8601()
        .withMessage('Horário final deve ser uma data válida')
        .custom((value, { req }) => {
          if (new Date(value) <= new Date(req.body.start_time)) {
            throw new Error('Horário final deve ser posterior ao horário inicial');
          }
          return true;
        }),

      body('status')
        .optional()
        .isIn(['ACTIVE', 'INACTIVE'])
        .withMessage('Status deve ser ACTIVE ou INACTIVE'),
    ];
  }

  static validateUpdate() {
    return [
      param('id')
        .isInt()
        .withMessage('ID deve ser um número inteiro'),

      body('status')
        .optional()
        .isIn(['ACTIVE', 'INACTIVE'])
        .withMessage('Status deve ser ACTIVE ou INACTIVE'),

      body('start_time')
        .optional()
        .isISO8601()
        .withMessage('Horário inicial deve ser uma data válida'),

      body('end_time')
        .optional()
        .isISO8601()
        .withMessage('Horário final deve ser uma data válida')
        .custom((value, { req }) => {
          if (new Date(value) <= new Date(req.body.start_time)) {
            throw new Error('Horário final deve ser posterior ao horário inicial');
          }
          return true;
        }),
    ];
  }

  static validateId() {
    return [
      param('id')
        .isInt()
        .withMessage('ID deve ser um número inteiro'),
    ];
  }

  static validateUserCode() {
    return [
      param('userCode')
        .notEmpty()
        .withMessage('Código do usuário é obrigatório')
        .isString()
        .withMessage('Código do usuário deve ser uma string'),
    ];
  }

  static validateDateRange() {
    return [
      query('startDate')
        .notEmpty()
        .withMessage('Data inicial é obrigatória')
        .isISO8601()
        .withMessage('Data inicial deve ser uma data válida'),

      query('endDate')
        .notEmpty()
        .withMessage('Data final é obrigatória')
        .isISO8601()
        .withMessage('Data final deve ser uma data válida')
        .custom((value, { req }) => {
          if (new Date(value) <= new Date(req.query.startDate)) {
            throw new Error('Data final deve ser posterior à data inicial');
          }
          return true;
        }),
    ];
  }

  static validateOverlapCheck() {
    return [
      body('userCode')
        .notEmpty()
        .withMessage('Código do usuário é obrigatório')
        .isString()
        .withMessage('Código do usuário deve ser uma string'),

      body('startTime')
        .notEmpty()
        .withMessage('Horário inicial é obrigatório')
        .isISO8601()
        .withMessage('Horário inicial deve ser uma data válida'),

      body('endTime')
        .notEmpty()
        .withMessage('Horário final é obrigatório')
        .isISO8601()
        .withMessage('Horário final deve ser uma data válida')
        .custom((value, { req }) => {
          if (new Date(value) <= new Date(req.body.startTime)) {
            throw new Error('Horário final deve ser posterior ao horário inicial');
          }
          return true;
        }),
    ];
  }
}
