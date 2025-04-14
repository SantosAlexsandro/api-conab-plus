"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _WorkShift = require('../models/WorkShift'); var _WorkShift2 = _interopRequireDefault(_WorkShift);
var _sequelize = require('sequelize');

// Função utilitária para verificar sobreposição
const checkShiftOverlap = async (userCode, startTime, endTime, excludeId = null) => {
  const whereClause = {
    user_code: userCode,
    // Removida a restrição de status, agora verificamos sobreposição com qualquer turno
    [_sequelize.Op.or]: [
      // Caso 1: Início do novo turno está entre o início e fim de um turno existente
      {
        [_sequelize.Op.and]: [
          { start_time: { [_sequelize.Op.lte]: startTime } },
          { end_time: { [_sequelize.Op.gte]: startTime } }
        ]
      },
      // Caso 2: Fim do novo turno está entre o início e fim de um turno existente
      {
        [_sequelize.Op.and]: [
          { start_time: { [_sequelize.Op.lte]: endTime } },
          { end_time: { [_sequelize.Op.gte]: endTime } }
        ]
      },
      // Caso 3: Novo turno engloba completamente um turno existente
      {
        [_sequelize.Op.and]: [
          { start_time: { [_sequelize.Op.gte]: startTime } },
          { end_time: { [_sequelize.Op.lte]: endTime } }
        ]
      }
    ]
  };

  // Se estamos atualizando um turno existente, excluímos ele mesmo da verificação
  if (excludeId) {
    whereClause.id = { [_sequelize.Op.ne]: excludeId };
  }

  const overlappingShifts = await _WorkShift2.default.findAll({
    where: whereClause
  });

  return overlappingShifts;
};

// Controller como objeto de funções
const WorkShiftController = {
  async index(req, res, next) {
    try {
      const workShifts = await _WorkShift2.default.findAll({
        order: [['created_at', 'DESC']],
      });
      return res.json(workShifts);
    } catch (error) {
      next(error);
    }
  },

  async store(req, res, next) {
    try {
      const { user_code, start_time, end_time, status } = req.body;

      // Verificar sobreposição sempre, independente do status
      const overlappingShifts = await checkShiftOverlap(user_code, start_time, end_time);

      if (overlappingShifts.length > 0) {
        const error = new Error('Existe sobreposição com outros turnos');
        error.statusCode = 409;
        error.details = { overlappingShifts };
        throw error;
      }

      const workShift = await _WorkShift2.default.create(req.body);
      return res.status(201).json(workShift);
    } catch (error) {
      next(error);
    }
  },

  async show(req, res, next) {
    try {
      const workShift = await _WorkShift2.default.findByPk(req.params.id);
      if (!workShift) {
        const error = new Error('Turno de trabalho não encontrado');
        error.statusCode = 404;
        throw error;
      }
      return res.json(workShift);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const workShift = await _WorkShift2.default.findByPk(req.params.id);
      if (!workShift) {
        const error = new Error('Turno de trabalho não encontrado');
        error.statusCode = 404;
        throw error;
      }

      const { user_code, start_time, end_time, status } = req.body;

      // Verificar sobreposição sempre, independente do status
      const overlappingShifts = await checkShiftOverlap(
        user_code || workShift.user_code,
        start_time || workShift.start_time,
        end_time || workShift.end_time,
        workShift.id
      );

      if (overlappingShifts.length > 0) {
        const error = new Error('Existe sobreposição com outros turnos');
        error.statusCode = 409;
        error.details = { overlappingShifts };
        throw error;
      }

      await workShift.update(req.body);
      return res.json(workShift);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const workShift = await _WorkShift2.default.findByPk(req.params.id);
      if (!workShift) {
        const error = new Error('Turno de trabalho não encontrado');
        error.statusCode = 404;
        throw error;
      }
      await workShift.destroy();
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async getActiveShifts(req, res, next) {
    try {
      const activeShifts = await _WorkShift2.default.findAll({
        where: { status: 'ACTIVE' },
        order: [['created_at', 'DESC']],
      });
      return res.json(activeShifts);
    } catch (error) {
      next(error);
    }
  },

  async getUserShifts(req, res, next) {
    try {
      const userShifts = await _WorkShift2.default.findAll({
        where: { user_code: req.params.userCode },
        order: [['created_at', 'DESC']],
      });
      return res.json(userShifts);
    } catch (error) {
      next(error);
    }
  },

  async getShiftsByDateRange(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const shifts = await _WorkShift2.default.findAll({
        where: {
          start_time: {
            [_sequelize.Op.gte]: startDate,
          },
          end_time: {
            [_sequelize.Op.lte]: endDate,
          },
        },
        order: [['start_time', 'ASC']],
      });
      return res.json(shifts);
    } catch (error) {
      next(error);
    }
  },

  async checkOverlap(req, res, next) {
    try {
      const { userCode, startTime, endTime } = req.body;
      const overlappingShifts = await checkShiftOverlap(userCode, startTime, endTime);
      return res.json({ hasOverlap: overlappingShifts.length > 0, shifts: overlappingShifts });
    } catch (error) {
      next(error);
    }
  }
};

exports. default = WorkShiftController;
