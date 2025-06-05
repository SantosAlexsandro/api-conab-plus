import WorkOrderWaitingQueue from '../models/workOrderWaitingQueue';
import EntityService from './EntityService';
import CityService from './CityService';
import logEvent from '../utils/logEvent';
import { resolveNumericIdentifier } from '../integrations/g4flex/utils/resolveNumericIdentifier';
import { Op } from 'sequelize';
import sequelize from '../database';
import customerService from '../integrations/g4flex/services/CustomerService';

export async function checkDuplicateRequest(uraRequestId) {
  console.log('INIT checkDuplicateRequest', { uraRequestId });

  if (!uraRequestId) throw new Error('uraRequestId is required');

  const existingRequest = await WorkOrderWaitingQueue.findOne({
    where: { uraRequestId }
  });

  return {
    isDuplicate: !!existingRequest,
    existingRequest
  };
}

export async function createInQueue(data) {
  console.log('INIT createInQueue', data);

  if (!data.uraRequestId) {
    throw new Error('uraRequestId is required');
  }

  try {
    let entityData = null;
    let cityData = null;

    // Tentar buscar dados da entidade, mas não falhar se não conseguir
    try {
      const getEntityData = async (customerIdentifier) => {
        const { identifierType, identifierValue } = resolveNumericIdentifier(customerIdentifier);
        const customerData = await customerService.getCustomerByIdentifier(identifierType, identifierValue);
        const entityData = await EntityService.getById(customerData.codigo);
        return entityData;
      }

      entityData = await getEntityData(data.customerIdentifier);

      // Tentar buscar dados da cidade
      if (entityData?.CodigoCidade) {
        cityData = await CityService.getCityByErpCode(entityData.CodigoCidade);
      }
    } catch (dataError) {
      console.warn('⚠️ Falha ao buscar dados da entidade/cidade:', dataError.message);
      // Log do erro mas continua o processo
      await logEvent({
        uraRequestId: data.uraRequestId,
        source: 'system',
        action: 'data_fetch_warning',
        payload: { error: dataError.message },
        response: { warning: 'Dados da entidade/cidade não puderam ser obtidos' },
        statusCode: 200
      });
    }

    const newRequest = await WorkOrderWaitingQueue.create({
      orderNumber: data.orderNumber,
      entityName: data.entityName,
      uraRequestId: data.uraRequestId,
      priority: data.priority || 'normal',
      status: data.status || 'WAITING_CREATION',
      source: data.source || 'g4flex',
      customerIdentifier: data.customerIdentifier,
      productId: data.productId,
      requesterNameAndPosition: data?.requesterNameAndPosition,
      incidentAndReceiverName: data?.incidentAndReceiverName,
      requesterContact: data?.requesterContact,
      // Usar dados se disponíveis, senão null
      customerStreet: entityData?.Endereco || null,
      customerNumber: entityData?.NumeroEndereco || null,
      customerAddressComplement: entityData?.ComplementoEndereco || null,
      customerNeighborhood: entityData?.Bairro || null,
      customerCity: cityData?.full_name || null,
      customerState: cityData?.acronym_federal_unit || null,
      customerZipCode: entityData?.Cep || null,
      customerCityErpCode: entityData?.CodigoCidade || null,
      customerStreetTypeCode: entityData?.CodigoTipoLograd || null
    });

    await logEvent({
      uraRequestId: data.uraRequestId,
      source: 'system',
      action: 'work_order_queue_created',
      payload: data,
      response: {
        queueId: newRequest.id,
        entityDataAvailable: !!entityData,
        cityDataAvailable: !!cityData
      },
      statusCode: 201
    });

    return {
      success: true,
      request: newRequest
    };
  } catch (error) {
    // TODO: Gerar aviso para whatsApp
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
    // Tentar atualizar pelo número da ordem caso o uraRequestId não encontre registros
    const queue = await WorkOrderWaitingQueue.findOne({
      where: { orderNumber: uraRequestId }
    });

    if (queue) {
      const [updateCount] = await WorkOrderWaitingQueue.update(
        { technicianAssigned: technicianName },
        { where: { orderNumber: uraRequestId } }
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

export async function findOldestWaitingOrderNotEditing() {
  console.log('🔎 INIT findOldestWaitingOrderNotEditing');

  const result = await WorkOrderWaitingQueue.findOne({
    where: {
      status: 'WAITING_TECHNICIAN',
      [Op.or]: [
        { isEditing: false },
        { isEditing: null }
      ]
    },
    order: [['created_at', 'ASC']] // Ordena pela data de criação (mais antiga primeiro)
  });

  if (!result) {
    console.log('⚠️ Nenhuma ordem disponível aguardando atribuição de técnico (todas em edição)');
    return null;
  }

  console.log(`✅ Ordem mais antiga não editando encontrada: ${result.orderNumber}, criada em ${result.created_at}`);
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

export async function setEditingFlag(orderNumber, isEditing, editedBy = null) {
  console.log('🔧 INIT setEditingFlag', { orderNumber, isEditing, editedBy });

  if (!orderNumber) throw new Error('orderNumber is required');

  const updateData = {
    isEditing,
    editedAt: isEditing ? new Date() : null,
    editedBy: isEditing ? editedBy : null
  };

  const [affectedCount] = await WorkOrderWaitingQueue.update(updateData, {
    where: { orderNumber }
  });

  if (affectedCount === 0) {
    console.warn('⚠️ No records updated in setEditingFlag', { orderNumber });
    throw new Error(`Order ${orderNumber} not found`);
  }

  console.log(`✅ Flag isEditing ${isEditing ? 'ativada' : 'desativada'} para ordem ${orderNumber}${editedBy ? ` por ${editedBy}` : ''}`);

  return {
    success: affectedCount > 0,
    updatedRows: affectedCount
  };
}

export async function isOrderBeingEdited(orderNumber) {
  console.log('🔎 INIT isOrderBeingEdited', { orderNumber });

  if (!orderNumber) throw new Error('orderNumber is required');

  const result = await WorkOrderWaitingQueue.findOne({
    where: { orderNumber },
    attributes: ['isEditing', 'editedAt']
  });

  if (!result) {
    console.warn('⚠️ No record found in isOrderBeingEdited', { orderNumber });
    return false;
  }

  return result.isEditing || false;
}

export async function isOrderEditingExpired(orderNumber, maxEditDurationMs = 10 * 60 * 1000) {
  console.log('🔎 INIT isOrderEditingExpired', { orderNumber, maxEditDurationMs });

  if (!orderNumber) throw new Error('orderNumber is required');

  const result = await WorkOrderWaitingQueue.findOne({
    where: { orderNumber },
    attributes: ['isEditing', 'editedAt', 'editedBy']
  });

  if (!result || !result.isEditing || !result.editedAt) {
    return false; // Não está em edição ou não tem editedAt
  }

  const editedTime = new Date(result.editedAt).getTime();
  const currentTime = Date.now();
  const editDurationSeconds = Math.floor((currentTime - editedTime) / 1000);
  const isExpired = (currentTime - editedTime) > maxEditDurationMs;

  if (isExpired) {
    console.log(`⏰ Edição da ordem ${orderNumber} expirada (TTL: ${maxEditDurationMs/1000/60}min)`);
    console.log(`   📊 Editada há ${editDurationSeconds}s por usuário: ${result.editedBy || 'Desconhecido'}`);
    console.log(`   🔧 Liberando ordem automaticamente...`);

    // Automaticamente desativar flag se expirou
    await setEditingFlag(orderNumber, false);
  }

  return isExpired;
}

export async function hasAnyOrderBeingEdited() {
  console.log('🔎 INIT hasAnyOrderBeingEdited');

  const result = await WorkOrderWaitingQueue.findOne({
    where: {
      status: 'WAITING_TECHNICIAN',
      isEditing: true
    },
    attributes: ['orderNumber', 'editedBy', 'editedAt']
  });

  if (result) {
    // Verificar se alguma das edições expirou
    const isExpired = await isOrderEditingExpired(result.orderNumber, 10 * 60 * 1000);

    if (!isExpired) {
      console.log(`🔒 Edição ativa detectada: Ordem ${result.orderNumber} sendo editada por ${result.editedBy}`);
      return {
        hasEditing: true,
        orderNumber: result.orderNumber,
        editedBy: result.editedBy,
        editedAt: result.editedAt
      };
    } else {
      // Se expirou, verificar novamente se há outras
      return hasAnyOrderBeingEdited();
    }
  }

  console.log(`✅ Nenhuma ordem em edição ativa - processamento pode continuar`);
  return {
    hasEditing: false,
    orderNumber: null,
    editedBy: null,
    editedAt: null
  };
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
  findOldestWaitingOrderNotEditing,
  findById,
  setEditingFlag,
  isOrderBeingEdited,
  isOrderEditingExpired,
  hasAnyOrderBeingEdited
};
