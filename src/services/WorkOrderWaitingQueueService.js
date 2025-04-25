import WorkOrderWaitingQueue from '../models/workOrderWaitingQueue';

export async function createInQueue(data) {
  return await WorkOrderWaitingQueue.create({
    orderNumber: data.orderNumber,
    entityName: data.entityName,
    serviceType: data.serviceType,
    priority: data.priority || 'normal',
    status: 'WAITING_CREATION',
    source: data.source || 'g4flex',
  });
}

export async function updateQueueStatus(orderNumber, newStatus) {
  return await WorkOrderWaitingQueue.update(
    { status: newStatus },
    { where: { orderNumber } }
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
  findByOrderNumber,
  findByStatus
};
