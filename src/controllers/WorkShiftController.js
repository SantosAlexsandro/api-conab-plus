import WorkShift from '../models/WorkShift';
import { Op } from 'sequelize';

// Função utilitária para verificar sobreposição
const checkShiftOverlap = async (userCode, startTime, endTime, excludeId = null) => {
  const whereClause = {
    user_code: userCode,
    // Removida a restrição de status, agora verificamos sobreposição com qualquer turno
    [Op.or]: [
      // Caso 1: Início do novo turno está entre o início e fim de um turno existente
      {
        [Op.and]: [
          { start_time: { [Op.lte]: startTime } },
          { end_time: { [Op.gte]: startTime } }
        ]
      },
      // Caso 2: Fim do novo turno está entre o início e fim de um turno existente
      {
        [Op.and]: [
          { start_time: { [Op.lte]: endTime } },
          { end_time: { [Op.gte]: endTime } }
        ]
      },
      // Caso 3: Novo turno engloba completamente um turno existente
      {
        [Op.and]: [
          { start_time: { [Op.gte]: startTime } },
          { end_time: { [Op.lte]: endTime } }
        ]
      }
    ]
  };

  // Se estamos atualizando um turno existente, excluímos ele mesmo da verificação
  if (excludeId) {
    whereClause.id = { [Op.ne]: excludeId };
  }

  const overlappingShifts = await WorkShift.findAll({
    where: whereClause
  });

  return overlappingShifts;
};

// Controller como objeto de funções
const WorkShiftController = {
  async index(req, res, next) {
    try {
      const workShifts = await WorkShift.findAll({
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

      const workShift = await WorkShift.create(req.body);
      return res.status(201).json(workShift);
    } catch (error) {
      next(error);
    }
  },

  async show(req, res, next) {
    try {
      const workShift = await WorkShift.findByPk(req.params.id);
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
      const workShift = await WorkShift.findByPk(req.params.id);
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
      const workShift = await WorkShift.findByPk(req.params.id);
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
      const activeShifts = await WorkShift.findAll({
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
      const userShifts = await WorkShift.findAll({
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
      const shifts = await WorkShift.findAll({
        where: {
          start_time: {
            [Op.gte]: startDate,
          },
          end_time: {
            [Op.lte]: endDate,
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

export default WorkShiftController;
