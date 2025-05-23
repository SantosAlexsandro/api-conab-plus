import WorkOrderWaitingQueue from '../models/workOrderWaitingQueue';
import logEvent from '../utils/logEvent';

export async function checkDuplicateRequest(uraRequestId) {
  const existingRequest = await WorkOrderWaitingQueue.findOne({
    where: { uraRequestId }
  });

  if (existingRequest) {
    await logEvent({
      uraRequestId,
      source: 'system',
      action: 'duplicate_work_order_request',
      payload: { existingStatus: existingRequest.status },
      response: { message: 'Duplicate work order request detected' },
      statusCode: 409,
      error: 'Duplicate work order request'
    });

    return {
      isDuplicate: true,
      existingRequest
    };
  }

  return {
    isDuplicate: false,
    existingRequest: null
  };
}

export async function createInQueue(data) {
  try {
    // Verifica duplicidade antes de criar
    const { isDuplicate, existingRequest } = await checkDuplicateRequest(data.uraRequestId);

    if (isDuplicate) {
      console.log(`[WorkOrderWaitingQueueService] Duplicate request detected for uraRequestId: ${data.uraRequestId}`);
      return {
        success: false,
        error: 'DUPLICATE_REQUEST',
        message: 'Uma solicitação com este ID já existe na fila',
        existingRequest
      };
    }

    const newRequest = await WorkOrderWaitingQueue.create({
      orderNumber: data.orderNumber,
      entityName: data.entityName,
      uraRequestId: data.uraRequestId,
      priority: data.priority || 'normal',
      status: 'WAITING_CREATION',
      source: data.source || 'g4flex',
    });

    await logEvent({
      uraRequestId: data.uraRequestId,
      source: 'system',
      action: 'work_order_queue_created',
      payload: data,
      response: { queueId: newRequest.id },
      statusCode: 201
    });

    return {
      success: true,
      request: newRequest
    };
  } catch (error) {
    await logEvent({
      uraRequestId: data.uraRequestId,
      source: 'system',
      action: 'work_order_queue_create_error',
      payload: data,
      response: { error: error.message },
      statusCode: 500,
      error: error.message
    });

    if (error.name === 'SequelizeUniqueConstraintError') {
      return {
        success: false,
        error: 'DUPLICATE_REQUEST',
        message: 'Uma solicitação com este ID já existe na fila'
      };
    }

    throw error;
  }
}

export async function updateQueueStatus(uraRequestId, orderNumber, newStatus) {
  console.log('INIT updateQueueStatus', { uraRequestId, orderNumber, newStatus });

  if (!newStatus) {
    throw new Error('newStatus is required');
  }

  if (!uraRequestId && !orderNumber) {
    throw new Error('At least uraRequestId or orderNumber must be provided');
  }

  const where = {};

  if (newStatus === 'WAITING_TECHNICIAN') {
    if (!uraRequestId) {
      throw new Error('uraRequestId is required when setting status to WAITING_TECHNICIAN');
    }
    where.uraRequestId = uraRequestId;
  } else {
    if (!orderNumber) {
      throw new Error('orderNumber is required when status is not WAITING_TECHNICIAN');
    }
    where.orderNumber = orderNumber;
  }

  const [affectedCount] = await WorkOrderWaitingQueue.update(
    { status: newStatus },
    { where }
  );

  if (affectedCount === 0) {
    console.warn('No records updated in WorkOrderWaitingQueue', { where, newStatus });
  }

  return {
    success: affectedCount > 0,
    updatedRows: affectedCount
  };
}


export async function updateQueueOrderNumber(uraRequestId, orderNumber) {
  console.log('🔄 INIT updateQueueOrderNumber', { uraRequestId, orderNumber });

  if (!uraRequestId) throw new Error('uraRequestId is required');
  if (!orderNumber) throw new Error('orderNumber is required');

  const [affectedCount] = await WorkOrderWaitingQueue.update(
    { orderNumber },
    { where: { uraRequestId } }
  );

  if (affectedCount === 0) {
    console.warn('⚠️ No records updated in updateQueueOrderNumber', { uraRequestId });
  }

  return {
    success: affectedCount > 0,
    updatedRows: affectedCount
  };
}

export async function updateTechnicianAssigned(uraRequestId, technicianName) {
  console.log('🔄 INIT updateTechnicianAssigned', { uraRequestId, technicianName });

  if (!uraRequestId) throw new Error('uraRequestId is required');
  if (!technicianName) throw new Error('technicianName is required');

  const [affectedCount] = await WorkOrderWaitingQueue.update(
    { technicianAssigned: technicianName },
    { where: { uraRequestId } }
  );

  if (affectedCount === 0) {
    console.warn('⚠️ No records updated in updateTechnicianAssigned', { uraRequestId });
  }

  return {
    success: affectedCount > 0,
    updatedRows: affectedCount
  };
}

export async function findByUraRequestId(uraRequestId) {
  console.log('🔎 INIT findByUraRequestId', { uraRequestId });

  if (!uraRequestId) throw new Error('uraRequestId is required');

  const result = await WorkOrderWaitingQueue.findOne({
    where: { uraRequestId }
  });

  if (!result) {
    console.warn('⚠️ No record found in findByUraRequestId', { uraRequestId });
  }

  return result;
}

export async function findByStatus(status) {
  console.log('🔎 INIT findByStatus', { status });

  if (!status) throw new Error('status is required');

  const results = await WorkOrderWaitingQueue.findAll({
    where: { status }
  });

  return results;
}

export async function findAll() {
  console.log('🔎 INIT findAll');

  return await WorkOrderWaitingQueue.findAll({
    order: [['created_at', 'DESC']]
  });
}


/*
export async function findByOrderNumber(orderNumber) {
  return await WorkOrderWaitingQueue.findOne({
    where: { orderNumber }
  });
}

export async function findById(id) {
  return await WorkOrderWaitingQueue.findByPk(id);
}
*/

export default {
  createInQueue,
  updateQueueStatus,
  updateQueueOrderNumber,
  updateTechnicianAssigned,
  findByUraRequestId,
  findByStatus,
  findAll
};
