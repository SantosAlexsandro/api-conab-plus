// import Entity from '../models/Entity';
import WorkOrderService from '../services/WorkOrderService';
import PushNotificationService from '../services/PushNotificationService';

class WorkOrderController {
  async create(req, res) {
    try {
      const newEntity = await WorkOrderService.create(req.body);
      const { data } = newEntity;

      // Envia notificação de nova ordem de serviço para todos os usuários
      try {
        await PushNotificationService.sendToAll({
          title: 'Nova Ordem de Serviço',
          body: `Uma nova OS foi criada: ${data.id || 'Sem ID'}`,
          data: {
            type: 'new_work_order',
            workOrderId: data.id,
            url: `/work-orders/${data.id}`
          }
        });
      } catch (notificationError) {
        console.error('Erro ao enviar notificação push:', notificationError);
        // Não interrompe o fluxo em caso de erro na notificação
      }

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

      // Envia notificação sobre a atualização da etapa da OS
      try {
        const { ordem_id, etapa_atual } = req.body;

        if (ordem_id) {
          await PushNotificationService.sendToAll({
            title: 'Atualização de Ordem de Serviço',
            body: `A OS #${ordem_id} foi atualizada para a etapa: ${etapa_atual || 'Nova etapa'}`,
            data: {
              type: 'work_order_stage_update',
              workOrderId: ordem_id,
              stage: etapa_atual,
              url: `/work-orders/${ordem_id}`
            }
          });
        }
      } catch (notificationError) {
        console.error('Erro ao enviar notificação push:', notificationError);
        // Não interrompe o fluxo em caso de erro na notificação
      }

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
