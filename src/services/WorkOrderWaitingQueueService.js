import WorkOrderWaitingQueue from '../models/workOrderWaitingQueue';
import EntityService from './EntityService';
import CityService from './CityService';
import logEvent from '../utils/logEvent';
import { resolveNumericIdentifier } from '../integrations/g4flex/utils/resolveNumericIdentifier';
import { Op } from 'sequelize';
import sequelize from '../database';

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

    // Get entity data
    let filter = ''
    const getEntityData = async (codigo) => {
      const { identifierType, identifierValue } = resolveNumericIdentifier(codigo);
      if (identifierType === 'customerId') {
        filter = `Codigo=${identifierValue}`
      } else if (identifierType === 'cpf') {
        filter = `CPFCNPJ=${identifierValue}`
      } else if (identifierType === 'cnpj') {
        filter = `CPFCNPJ=${identifierValue}`
      }
      const entity = await EntityService.loadEntityByFilter(filter)
      return entity;
    }
    const entityData = await getEntityData(data.customerIdentifier);

    // Get city data
    const cityData = await CityService.getCityByErpCode(entityData?.CodigoCidade)


    const newRequest = await WorkOrderWaitingQueue.create({
      orderNumber: data.orderNumber,
      entityName: data.entityName,
      uraRequestId: data.uraRequestId,
      priority: data.priority || 'normal',
      status: data.status || 'WAITING_CREATION',
      source: data.source || 'g4flex',
      customerIdentifier: data.customerIdentifier,
      productId: data.productId,
      requesterNameAndPosition: data.requesterNameAndPosition,
      incidentAndReceiverName: data.incidentAndReceiverName,
      requesterContact: data.requesterContact,
      customerStreet: entityData?.Endereco,
      customerNumber: entityData?.NumeroEndereco,
      customerAddressComplement: entityData?.ComplementoEndereco,
      customerNeighborhood: entityData?.Bairro,
      customerCity: cityData?.full_name,
      customerState: cityData?.acronym_federal_unit,
      customerZipCode: entityData?.Cep,
      customerCityErpCode: entityData?.CodigoCidade,
      customerStreetTypeCode: entityData?.CodigoTipoLograd
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

export async function updateQueueStatus(uraRequestId, orderNumber, newStatus, transaction = null) {
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

  const updateOptions = { where };
  if (transaction) updateOptions.transaction = transaction;

  const [affectedCount] = await WorkOrderWaitingQueue.update(
    { status: newStatus },
    updateOptions
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

export async function updateTechnicianAssigned(uraRequestId, technicianName, transaction = null) {
  console.log('🔄 INIT updateTechnicianAssigned', { uraRequestId, technicianName });

  if (!uraRequestId) throw new Error('uraRequestId is required');
  if (!technicianName) throw new Error('technicianName is required');

  const updateOptions = { where: { uraRequestId } };
  if (transaction) updateOptions.transaction = transaction;

  const [affectedCount] = await WorkOrderWaitingQueue.update(
    { technicianAssigned: technicianName },
    updateOptions
  );

  if (affectedCount === 0) {
    // Tentar atualizar pelo número da ordem caso o uraRequestId não encontre registros
    const findOptions = { where: { orderNumber: uraRequestId } };
    if (transaction) findOptions.transaction = transaction;

    const queue = await WorkOrderWaitingQueue.findOne(findOptions);

    if (queue) {
      const updateOrderOptions = { where: { orderNumber: uraRequestId } };
      if (transaction) updateOrderOptions.transaction = transaction;

      const [updateCount] = await WorkOrderWaitingQueue.update(
        { technicianAssigned: technicianName },
        updateOrderOptions
      );

      if (updateCount > 0) {
        console.log(`✅ Técnico ${technicianName} atribuído à ordem ${uraRequestId}`);
        return {
          success: true,
          updatedRows: updateCount
        };
      }
    }

    console.warn('⚠️ No records updated in updateTechnicianAssigned', { uraRequestId });
  } else {
    console.log(`✅ Técnico ${technicianName} atribuído ao pedido ${uraRequestId}`);
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

export async function findByOrderNumber(orderNumber) {
  console.log('🔎 INIT findByOrderNumber', { orderNumber });

  if (!orderNumber) throw new Error('orderNumber is required');

  const result = await WorkOrderWaitingQueue.findOne({
    where: { orderNumber }
  });

  if (!result) {
    console.warn('⚠️ No record found in findByOrderNumber', { orderNumber });
  }

  return result;
}

export async function findOldestWaitingOrder() {
  console.log('🔎 INIT findOldestWaitingOrder');

  const result = await WorkOrderWaitingQueue.findOne({
    where: {
      status: 'WAITING_TECHNICIAN'
    },
    order: [['created_at', 'ASC']] // Ordena pela data de criação (mais antiga primeiro)
  });

  if (!result) {
    console.log('⚠️ Nenhuma ordem aguardando atribuição de técnico encontrada');
    return null;
  }

  console.log(`✅ Ordem mais antiga encontrada: ${result.orderNumber}, criada em ${result.created_at}`);
  return result;
}

export async function findAndLockOldestWaitingOrder(transaction) {
  console.log('🔒 INIT findAndLockOldestWaitingOrder com bloqueio transacional');

  if (!transaction) {
    console.error('❌ É necessário fornecer uma transação para o bloqueio');
    throw new Error('Transaction is required for locking');
  }

  const result = await WorkOrderWaitingQueue.findOne({
    where: {
      status: 'WAITING_TECHNICIAN'
    },
    order: [['created_at', 'ASC']], // Ordena pela data de criação (mais antiga primeiro)
    lock: transaction.LOCK.UPDATE,
    transaction
  });

  if (!result) {
    console.log('⚠️ Nenhuma ordem aguardando atribuição de técnico encontrada');
    return null;
  }

  console.log(`🔐 Ordem mais antiga encontrada e BLOQUEADA: ${result.orderNumber}, criada em ${result.created_at}`);
  return result;
}

export async function findById(id) {
  console.log('🔎 INIT findById', { id });

  if (!id) throw new Error('id is required');

  const result = await WorkOrderWaitingQueue.findByPk(id);

  if (!result) {
    console.warn('⚠️ No record found in findById', { id });
  }

  return result;
}

export default {
  createInQueue,
  updateQueueStatus,
  updateQueueOrderNumber,
  updateTechnicianAssigned,
  findByUraRequestId,
  findByStatus,
  findAll,
  findByOrderNumber,
  findOldestWaitingOrder,
  findAndLockOldestWaitingOrder,
  findById
};
