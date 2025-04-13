import WorkShift from '../models/WorkShift';
import { Op } from 'sequelize';

class WorkShiftController {
  async index(req, res) {
    try {
      const workShifts = await WorkShift.findAll({
        order: [['created_at', 'DESC']],
      });
      return res.json(workShifts);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar turnos de trabalho' });
    }
  }

  async store(req, res) {
    try {
      const workShift = await WorkShift.create(req.body);
      return res.status(201).json(workShift);
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao criar turno de trabalho' });
    }
  }

  async show(req, res) {
    try {
      const workShift = await WorkShift.findByPk(req.params.id);
      if (!workShift) {
        return res.status(404).json({ error: 'Turno de trabalho não encontrado' });
      }
      return res.json(workShift);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar turno de trabalho' });
    }
  }

  async update(req, res) {
    try {
      const workShift = await WorkShift.findByPk(req.params.id);
      if (!workShift) {
        return res.status(404).json({ error: 'Turno de trabalho não encontrado' });
      }
      await workShift.update(req.body);
      return res.json(workShift);
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao atualizar turno de trabalho' });
    }
  }

  async delete(req, res) {
    try {
      const workShift = await WorkShift.findByPk(req.params.id);
      if (!workShift) {
        return res.status(404).json({ error: 'Turno de trabalho não encontrado' });
      }
      await workShift.destroy();
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar turno de trabalho' });
    }
  }

  async getActiveShifts(req, res) {
    try {
      const activeShifts = await WorkShift.findAll({
        where: { status: 'ACTIVE' },
        order: [['created_at', 'DESC']],
      });
      return res.json(activeShifts);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar turnos ativos' });
    }
  }

  async getUserShifts(req, res) {
    try {
      const userShifts = await WorkShift.findAll({
        where: { user_code: req.params.userCode },
        order: [['created_at', 'DESC']],
      });
      return res.json(userShifts);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar turnos do usuário' });
    }
  }

  async getShiftsByDateRange(req, res) {
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
      return res.status(500).json({ error: 'Erro ao buscar turnos por período' });
    }
  }

  async checkOverlap(req, res) {
    try {
      const { userCode, startTime, endTime } = req.body;
      const overlappingShifts = await WorkShift.findAll({
        where: {
          user_code: userCode,
          status: 'ACTIVE',
          [Op.or]: [
            {
              start_time: {
                [Op.between]: [startTime, endTime],
              },
            },
            {
              end_time: {
                [Op.between]: [startTime, endTime],
              },
            },
          ],
        },
      });
      return res.json({ hasOverlap: overlappingShifts.length > 0, shifts: overlappingShifts });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao verificar sobreposição de turnos' });
    }
  }
}

export default new WorkShiftController();
