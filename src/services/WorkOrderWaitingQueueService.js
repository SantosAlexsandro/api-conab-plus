import WorkOrderWaitingQueue from '../models/workOrderWaitingQueue';

export async function createInQueue(data) {
  return await WorkOrderWaitingQueue.create({
    orderNumber: data.orderNumber,
    entityName: data.entityName,
    uraRequestId: data.uraRequestId,
    priority: data.priority || 'normal',
    status: 'WAITING_CREATION',
    source: data.source || 'g4flex',
  });
}

export async function updateQueueStatus(uraRequestId, newStatus) {
  return await WorkOrderWaitingQueue.update(
    { status: newStatus },
    { where: { uraRequestId } }
  );
}

export async function updateQueueOrderNumber(uraRequestId, orderNumber) {
  return await WorkOrderWaitingQueue.update(
    { orderNumber },
    { where: { uraRequestId } }
  );
}

export async function updateTechnicianAssigned(uraRequestId, technicianName) {
  return await WorkOrderWaitingQueue.update(
    { technicianAssigned: technicianName },
    { where: { uraRequestId } }
  );
}

export async function findByOrderNumber(orderNumber) {
  return await WorkOrderWaitingQueue.findOne({
    where: { orderNumber }
  });
}

export async function findByStatus(status) {
  return await WorkOrderWaitingQueue.findAll({
    where: { status }
  });
}

export default {
  createInQueue,
  updateQueueStatus,
  updateQueueOrderNumber,
  updateTechnicianAssigned,
  findByOrderNumber,
  findByStatus
};
