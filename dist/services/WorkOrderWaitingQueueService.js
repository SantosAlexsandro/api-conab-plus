"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _workOrderWaitingQueue = require('../models/workOrderWaitingQueue'); var _workOrderWaitingQueue2 = _interopRequireDefault(_workOrderWaitingQueue);

 async function createInQueue(data) {
  return await _workOrderWaitingQueue2.default.create({
    orderNumber: data.orderNumber,
    entityName: data.entityName,
    uraRequestId: data.uraRequestId,
    priority: data.priority || 'normal',
    status: 'WAITING_CREATION',
    source: data.source || 'g4flex',
  });
} exports.createInQueue = createInQueue;

 async function updateQueueStatus(uraRequestId, newStatus) {
  return await _workOrderWaitingQueue2.default.update(
    { status: newStatus },
    { where: { uraRequestId } }
  );
} exports.updateQueueStatus = updateQueueStatus;

 async function updateQueueOrderNumber(uraRequestId, orderNumber) {
  return await _workOrderWaitingQueue2.default.update(
    { orderNumber },
    { where: { uraRequestId } }
  );
} exports.updateQueueOrderNumber = updateQueueOrderNumber;

 async function updateTechnicianAssigned(uraRequestId, technicianName) {
  return await _workOrderWaitingQueue2.default.update(
    { technicianAssigned: technicianName },
    { where: { uraRequestId } }
  );
} exports.updateTechnicianAssigned = updateTechnicianAssigned;

 async function findByUraRequestId(uraRequestId) {
  return await _workOrderWaitingQueue2.default.findOne({
    where: { uraRequestId }
  });
} exports.findByUraRequestId = findByUraRequestId;

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

 async function findByStatus(status) {
  return await _workOrderWaitingQueue2.default.findAll({
    where: { status }
  });
} exports.findByStatus = findByStatus;

 async function findAll() {
  return await _workOrderWaitingQueue2.default.findAll({
    order: [['created_at', 'DESC']]
  });
} exports.findAll = findAll;

exports. default = {
  createInQueue,
  updateQueueStatus,
  updateQueueOrderNumber,
  updateTechnicianAssigned,
  findByUraRequestId,
  findByStatus,
  findAll
};
