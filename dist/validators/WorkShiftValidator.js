"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _expressvalidator = require('express-validator');

 class WorkShiftValidator {
  static validateStore() {
    return [
      _expressvalidator.body.call(void 0, 'user_code')
        .notEmpty()
        .withMessage('Código do usuário é obrigatório')
        .isString()
        .withMessage('Código do usuário deve ser uma string'),

      _expressvalidator.body.call(void 0, 'start_time')
        .notEmpty()
        .withMessage('Horário inicial é obrigatório')
        .isISO8601()
        .withMessage('Horário inicial deve ser uma data válida'),

      _expressvalidator.body.call(void 0, 'end_time')
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

      _expressvalidator.body.call(void 0, 'status')
        .optional()
        .isIn(['ACTIVE', 'INACTIVE'])
        .withMessage('Status deve ser ACTIVE ou INACTIVE'),
    ];
  }

  static validateUpdate() {
    return [
      _expressvalidator.param.call(void 0, 'id')
        .isInt()
        .withMessage('ID deve ser um número inteiro'),

      _expressvalidator.body.call(void 0, 'status')
        .optional()
        .isIn(['ACTIVE', 'INACTIVE'])
        .withMessage('Status deve ser ACTIVE ou INACTIVE'),

      _expressvalidator.body.call(void 0, 'start_time')
        .optional()
        .isISO8601()
        .withMessage('Horário inicial deve ser uma data válida'),

      _expressvalidator.body.call(void 0, 'end_time')
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
      _expressvalidator.param.call(void 0, 'id')
        .isInt()
        .withMessage('ID deve ser um número inteiro'),
    ];
  }

  static validateUserCode() {
    return [
      _expressvalidator.param.call(void 0, 'userCode')
        .notEmpty()
        .withMessage('Código do usuário é obrigatório')
        .isString()
        .withMessage('Código do usuário deve ser uma string'),
    ];
  }

  static validateDateRange() {
    return [
      _expressvalidator.query.call(void 0, 'startDate')
        .notEmpty()
        .withMessage('Data inicial é obrigatória')
        .isISO8601()
        .withMessage('Data inicial deve ser uma data válida'),

      _expressvalidator.query.call(void 0, 'endDate')
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
      _expressvalidator.body.call(void 0, 'userCode')
        .notEmpty()
        .withMessage('Código do usuário é obrigatório')
        .isString()
        .withMessage('Código do usuário deve ser uma string'),

      _expressvalidator.body.call(void 0, 'startTime')
        .notEmpty()
        .withMessage('Horário inicial é obrigatório')
        .isISO8601()
        .withMessage('Horário inicial deve ser uma data válida'),

      _expressvalidator.body.call(void 0, 'endTime')
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
} exports.WorkShiftValidator = WorkShiftValidator;
