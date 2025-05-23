"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _workOrderWaitingQueue = require('../models/workOrderWaitingQueue'); var _workOrderWaitingQueue2 = _interopRequireDefault(_workOrderWaitingQueue);
var _logEvent = require('../utils/logEvent'); var _logEvent2 = _interopRequireDefault(_logEvent);

 async function checkDuplicateRequest(uraRequestId) {
  const existingRequest = await _workOrderWaitingQueue2.default.findOne({
    where: { uraRequestId }
  });

  if (existingRequest) {
    await _logEvent2.default.call(void 0, {
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
} exports.checkDuplicateRequest = checkDuplicateRequest;

 async function createInQueue(data) {
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

    const newRequest = await _workOrderWaitingQueue2.default.create({
      orderNumber: data.orderNumber,
      entityName: data.entityName,
      uraRequestId: data.uraRequestId,
      priority: data.priority || 'normal',
      status: 'WAITING_CREATION',
      source: data.source || 'g4flex',
    });

    await _logEvent2.default.call(void 0, {
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
    await _logEvent2.default.call(void 0, {
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
} exports.createInQueue = createInQueue;

 async function updateQueueStatus(uraRequestId, orderNumber, newStatus) {
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

  const [affectedCount] = await _workOrderWaitingQueue2.default.update(
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
} exports.updateQueueStatus = updateQueueStatus;


 async function updateQueueOrderNumber(uraRequestId, orderNumber) {
  console.log('🔄 INIT updateQueueOrderNumber', { uraRequestId, orderNumber });

  if (!uraRequestId) throw new Error('uraRequestId is required');
  if (!orderNumber) throw new Error('orderNumber is required');

  const [affectedCount] = await _workOrderWaitingQueue2.default.update(
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
} exports.updateQueueOrderNumber = updateQueueOrderNumber;

 async function updateTechnicianAssigned(uraRequestId, technicianName) {
  console.log('🔄 INIT updateTechnicianAssigned', { uraRequestId, technicianName });

  if (!uraRequestId) throw new Error('uraRequestId is required');
  if (!technicianName) throw new Error('technicianName is required');

  const [affectedCount] = await _workOrderWaitingQueue2.default.update(
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
} exports.updateTechnicianAssigned = updateTechnicianAssigned;

 async function findByUraRequestId(uraRequestId) {
  console.log('🔎 INIT findByUraRequestId', { uraRequestId });

  if (!uraRequestId) throw new Error('uraRequestId is required');

  const result = await _workOrderWaitingQueue2.default.findOne({
    where: { uraRequestId }
  });

  if (!result) {
    console.warn('⚠️ No record found in findByUraRequestId', { uraRequestId });
  }

  return result;
} exports.findByUraRequestId = findByUraRequestId;

 async function findByStatus(status) {
  console.log('🔎 INIT findByStatus', { status });

  if (!status) throw new Error('status is required');

  const results = await _workOrderWaitingQueue2.default.findAll({
    where: { status }
  });

  return results;
} exports.findByStatus = findByStatus;

 async function findAll() {
  console.log('🔎 INIT findAll');

  return await _workOrderWaitingQueue2.default.findAll({
    order: [['created_at', 'DESC']]
  });
} exports.findAll = findAll;


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

exports. default = {
  createInQueue,
  updateQueueStatus,
  updateQueueOrderNumber,
  updateTechnicianAssigned,
  findByUraRequestId,
  findByStatus,
  findAll
};
