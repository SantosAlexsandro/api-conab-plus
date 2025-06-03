import logEvent from '../utils/logEvent';
import WorkOrderWaitingQueueService from '../services/WorkOrderWaitingQueueService';

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

  // Pausar atribuição de técnico se ordem estiver aguardando
  async pauseTechnicianAssignment(req, res) {
    let { uraRequestId = '' } = req.query;
    const { orderNumber } = req.params;
    const userId = req.userId;

    console.log('🔍 INIT pauseTechnicianAssignment', { uraRequestId, orderNumber, userId });

    try {
      if (!orderNumber || !userId) {
        const errorMsg = 'Order number is required and user must be authenticated';
        await logEvent({
          uraRequestId,
          source: 'system',
          action: 'pause_technician_assignment_validation_error',
          payload: { orderNumber, userId },
          response: { error: errorMsg },
          statusCode: 400,
          error: errorMsg
        });
        return res.status(400).json({ error: errorMsg });
      }

      // Buscar informações da ordem na fila de espera
      const queueData = await WorkOrderWaitingQueueService.findByOrderNumber(orderNumber);

      if (!queueData) {
        const errorMsg = 'Order not found in waiting queue';
        await logEvent({
          uraRequestId,
          source: 'system',
          action: 'pause_technician_assignment_not_found',
          payload: { orderNumber, userId },
          response: { error: errorMsg },
          statusCode: 404,
          error: errorMsg
        });
        return res.status(404).json({ error: errorMsg });
      }

      // Verificar se o status é WAITING_TECHNICIAN
      if (queueData.status !== 'WAITING_TECHNICIAN') {
        const errorMsg = `Order is not waiting for technician assignment. Current status: ${queueData.status}`;
        await logEvent({
          uraRequestId,
          source: 'system',
          action: 'pause_technician_assignment_invalid_status',
          payload: { orderNumber, userId, currentStatus: queueData.status },
          response: { error: errorMsg },
          statusCode: 400,
          error: errorMsg
        });
        return res.status(400).json({
          error: errorMsg,
          currentStatus: queueData.status
        });
      }

      // Verificar se já está em edição
      if (queueData.isEditing) {
        const errorMsg = 'Order is already being edited';
        await logEvent({
          uraRequestId,
          source: 'system',
          action: 'pause_technician_assignment_already_editing',
          payload: { orderNumber, userId, currentStatus: queueData.status },
          response: { error: errorMsg },
          statusCode: 409,
          error: errorMsg
        });
        return res.status(409).json({
          error: errorMsg,
          isEditing: true
        });
      }

      // Ativar flag isEditing no banco de dados
      await WorkOrderWaitingQueueService.setEditingFlag(orderNumber, true);

      const result = {
        success: true,
        orderNumber,
        status: queueData.status,
        isEditing: true,
        message: `Technician assignment paused for order ${orderNumber}. Workers will skip this order.`,
        pausedBy: userId
      };

      await logEvent({
        uraRequestId,
        source: 'system',
        action: 'pause_technician_assignment_success',
        payload: { orderNumber, userId, isEditing: true },
        response: result,
        statusCode: 200,
        error: null
      });

      console.log(`[WorkOrderWaitingQueueController] Flag isEditing ativada para ordem ${orderNumber} por usuário ${userId}`);
      return res.json(result);
    } catch (error) {
      const statusCode = error.status || 500;
      const errorMessage = error.message || 'Error pausing technician assignment';

      await logEvent({
        uraRequestId,
        source: 'system',
        action: 'pause_technician_assignment_error',
        payload: { orderNumber, userId },
        response: { error: errorMessage },
        statusCode,
        error: errorMessage
      });

      console.error(`[WorkOrderWaitingQueueController] Erro ao pausar atribuição de técnico:`, error);
      return res.status(statusCode).json({ error: errorMessage });
    }
  }

  // Retomar atribuição de técnico (desativar flag isEditing)
  async resumeTechnicianAssignment(req, res) {
    let { uraRequestId = '' } = req.query;
    const { orderNumber } = req.params;
    const userId = req.userId;

    try {
      if (!orderNumber || !userId) {
        const errorMsg = 'Order number is required and user must be authenticated';
        await logEvent({
          uraRequestId,
          source: 'system',
          action: 'resume_technician_assignment_validation_error',
          payload: { orderNumber, userId },
          response: { error: errorMsg },
          statusCode: 400,
          error: errorMsg
        });
        return res.status(400).json({ error: errorMsg });
      }

      // Buscar informações da ordem na fila de espera
      const queueData = await WorkOrderWaitingQueueService.findByOrderNumber(orderNumber);

      if (!queueData) {
        const errorMsg = 'Order not found in waiting queue';
        await logEvent({
          uraRequestId,
          source: 'system',
          action: 'resume_technician_assignment_not_found',
          payload: { orderNumber, userId },
          response: { error: errorMsg },
          statusCode: 404,
          error: errorMsg
        });
        return res.status(404).json({ error: errorMsg });
      }

      // Verificar se está em edição
      if (!queueData.isEditing) {
        const errorMsg = 'Order is not currently being edited';
        await logEvent({
          uraRequestId,
          source: 'system',
          action: 'resume_technician_assignment_not_editing',
          payload: { orderNumber, userId, currentStatus: queueData.status },
          response: { error: errorMsg },
          statusCode: 400,
          error: errorMsg
        });
        return res.status(400).json({
          error: errorMsg,
          isEditing: false
        });
      }

      // Desativar flag isEditing no banco de dados
      await WorkOrderWaitingQueueService.setEditingFlag(orderNumber, false);

      const result = {
        success: true,
        orderNumber,
        status: queueData.status,
        isEditing: false,
        message: `Technician assignment resumed for order ${orderNumber}. Workers will process this order normally.`,
        resumedBy: userId
      };

      await logEvent({
        uraRequestId,
        source: 'system',
        action: 'resume_technician_assignment_success',
        payload: { orderNumber, userId, isEditing: false },
        response: result,
        statusCode: 200,
        error: null
      });

      console.log(`[WorkOrderWaitingQueueController] Flag isEditing desativada para ordem ${orderNumber} por usuário ${userId}`);
      return res.json(result);
    } catch (error) {
      const statusCode = error.status || 500;
      const errorMessage = error.message || 'Error resuming technician assignment';

      await logEvent({
        uraRequestId,
        source: 'system',
        action: 'resume_technician_assignment_error',
        payload: { orderNumber, userId },
        response: { error: errorMessage },
        statusCode,
        error: errorMessage
      });

      console.error(`[WorkOrderWaitingQueueController] Erro ao retomar atribuição de técnico:`, error);
      return res.status(statusCode).json({ error: errorMessage });
    }
  }
}

export default new WorkOrderWaitingQueueController();
