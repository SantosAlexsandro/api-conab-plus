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

export async function updateQueueStatus(uraRequestId, orderNumber, newStatus) {
  console.log('INIT updateQueueStatus', { uraRequestId, orderNumber, newStatus });
  return await WorkOrderWaitingQueue.update(
    { status: newStatus },
    { where: { orderNumber } }
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

export async function findByUraRequestId(uraRequestId) {
  return await WorkOrderWaitingQueue.findOne({
    where: { uraRequestId }
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

export async function findByStatus(status) {
  return await WorkOrderWaitingQueue.findAll({
    where: { status }
  });
}

export async function findAll() {
  return await WorkOrderWaitingQueue.findAll({
    order: [['created_at', 'DESC']]
  });
}

export default {
  createInQueue,
  updateQueueStatus,
  updateQueueOrderNumber,
  updateTechnicianAssigned,
  findByUraRequestId,
  findByStatus,
  findAll
};
