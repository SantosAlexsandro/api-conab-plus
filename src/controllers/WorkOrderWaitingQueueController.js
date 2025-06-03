import * as WorkOrderWaitingQueueService from '../services/WorkOrderWaitingQueueService';

class WorkOrderWaitingQueueController {
  async index(req, res) {
    try {
      const { status } = req.query;

      let workOrders;
      if (status) {
        workOrders = await WorkOrderWaitingQueueService.findByStatus(status);
      } else {
        // Se não for fornecido status, buscar todos os registros
        workOrders = await WorkOrderWaitingQueueService.findAll();
      }

      return res.json(workOrders);
    } catch (error) {
      console.error('Erro ao buscar ordens de trabalho:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /*
  async show(req, res) {
    try {
      const { id } = req.params;

      const workOrder = await WorkOrderWaitingQueueService.findById(id);

      if (!workOrder) {
        return res.status(404).json({ error: 'Ordem de trabalho não encontrada' });
      }

      return res.json(workOrder);
    } catch (error) {
      console.error('Erro ao buscar ordem de trabalho:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }


  async findByOrderNumber(req, res) {
    try {
      const { orderNumber } = req.params;

      const workOrder = await WorkOrderWaitingQueueService.findByOrderNumber(orderNumber);

      if (!workOrder) {
        return res.status(404).json({ error: 'Ordem de trabalho não encontrada' });
      }

      return res.json(workOrder);
    } catch (error) {
      console.error('Erro ao buscar ordem de trabalho:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async findByUraRequestId(req, res) {
    try {
      const { uraRequestId } = req.params;

      const workOrder = await WorkOrderWaitingQueueService.findByUraRequestId(uraRequestId);

      if (!workOrder) {
        return res.status(404).json({ error: 'Ordem de trabalho não encontrada' });
      }

      return res.json(workOrder);
    } catch (error) {
      console.error('Erro ao buscar ordem de trabalho:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }


  async getStatusOptions(req, res) {
    // Retorna os valores possíveis de status e prioridade (enums)
    const statusValues = [
      'RECEIVED',
      'WAITING_CREATION',
      'WAITING_TECHNICIAN',
      'WAITING_ARRIVAL',
      'IN_PROGRESS',
      'FINISHED',
      'FAILED'
    ];

    const priorityValues = ['low', 'normal', 'high'];



    return res.json({
      statusValues,
      priorityValues
    });
  }
      */
}

export default new WorkOrderWaitingQueueController();
