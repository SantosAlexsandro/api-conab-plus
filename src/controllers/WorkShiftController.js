import WorkShift from '../models/WorkShift';

class WorkShiftController {
  async index(req, res) {
    try {
      const workShifts = await WorkShift.findAll({
        order: [['start_time', 'ASC']],
      });

      return res.json(workShifts);
    } catch (error) {
      return res.status(500).json({
        errors: ['Erro ao buscar turnos de trabalho'],
      });
    }
  }

  async store(req, res) {
    try {
      const {
        status,
        start_time,
        end_time,
        technician_id,
      } = req.body;

      const workShift = await WorkShift.create({
        status,
        start_time,
        end_time,
        technician_id,
      });

      return res.json(workShift);
    } catch (error) {
      return res.status(400).json({
        errors: error.errors ? error.errors.map((err) => err.message) : ['Erro ao criar turno de trabalho'],
      });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;

      const workShift = await WorkShift.findByPk(id);

      if (!workShift) {
        return res.status(404).json({
          errors: ['Turno não encontrado'],
        });
      }

      return res.json(workShift);
    } catch (error) {
      return res.status(500).json({
        errors: ['Erro ao buscar turno de trabalho'],
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;

      const workShift = await WorkShift.findByPk(id);
      if (!workShift) {
        return res.status(404).json({
          errors: ['Turno não encontrado'],
        });
      }

      const {
        status,
        start_time,
        end_time,
        technician_id,
      } = req.body;

      const updatedWorkShift = await workShift.update({
        status,
        start_time,
        end_time,
        technician_id,
      });

      return res.json(updatedWorkShift);
    } catch (error) {
      return res.status(400).json({
        errors: error.errors ? error.errors.map((err) => err.message) : ['Erro ao atualizar turno de trabalho'],
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const workShift = await WorkShift.findByPk(id);
      if (!workShift) {
        return res.status(404).json({
          errors: ['Turno não encontrado'],
        });
      }

      await workShift.destroy();

      return res.json({ deleted: true });
    } catch (error) {
      return res.status(500).json({
        errors: ['Erro ao excluir turno de trabalho'],
      });
    }
  }
}

export default new WorkShiftController();
