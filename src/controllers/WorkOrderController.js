// import Entity from '../models/Entity';
import WorkOrderService from '../services/WorkOrderService';

class WorkOrderController {
  async create(req, res) {
    try {
      const newEntity = await WorkOrderService.create(req.body);
      const { data } = newEntity;

      // Notificação será enviada automaticamente pelo g4flex WorkOrderService
      // se for uma OS criada através da integração

      return res.json( data );
    } catch (e) {
      return res.status(400).json({ errors: e.errors.map((err) => err.message) });
    }
  }

  async getAll(req, res) {
    try {
      const { page = 1, filter = "" } = req.query;
      const { data } = await WorkOrderService.getAll(page, filter);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getAllbyTech(req, res) {
    try {
      console.log("getAll");
      const response = await WorkOrderService.getAllbyTech();

      return res.json(response);
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({ message: error.message });
    }
  }

  // Atualiza a etapa da ordem de serviço
  async updateOrderStage(req, res) {
    try {
      console.log("updateOrderStage");
      const response = await WorkOrderService.updateOrderStage(req.body);

      // Notificação de atualização será tratada separadamente se necessário
      // Removida para evitar duplicação com o sistema de notificações persistentes

      return res.json(response);
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({ message: error.message });
    }
  }

  // Retorna as próximas etapas da ordem de serviço
  async getNextStages(req, res) {
    try {
      console.log("getNextStages");
      const response = await WorkOrderService.getNextStages();
      return res.json(response);
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({ message: error.message });
    }
  }

   /*
  // Show
  async show(req, res) {
    try {
      const user = await Entity.findByPk(req.params.id);
      const { id, nome, email } = user;
      return res.json({ id, nome, email });
    } catch (e) {
      return res.status(400).json({ errors: e.errors.map((err) => err.message) });
    }
  }

  // Update
  async update(req, res) {
    try {
      const user = await Entity.findByPk(req.userId);
      if (!user) {
        return res.status(400).json({
          errors: ['Usuário não existe.'],
        });
      }
      const novosDados = await user.update(req.body);
      const { id, nome, email } = novosDados;
      return res.json({ id, nome, email });
    } catch (e) {
      return res.status(400).json({ errors: e.errors.map((err) => err.message) });
    }
  }

  // Delete
  async delete(req, res) {
    try {
      const user = await Entity.findByPk(req.userId);
      if (!user) {
        return res.status(400).json({
          errors: ['Usuário não existe.'],
        });
      }
      await user.destroy();
      return res.json(null);
    } catch (e) {
      return res.status(400).json({ errors: e.errors.map((err) => err.message) });
    }
  }*/


}

export default new WorkOrderController();
