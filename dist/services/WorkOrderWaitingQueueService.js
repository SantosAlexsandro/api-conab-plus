"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _workOrderWaitingQueue = require('../models/workOrderWaitingQueue'); var _workOrderWaitingQueue2 = _interopRequireDefault(_workOrderWaitingQueue);
var _EntityService = require('./EntityService'); var _EntityService2 = _interopRequireDefault(_EntityService);
var _CityService = require('./CityService'); var _CityService2 = _interopRequireDefault(_CityService);
var _logEvent = require('../utils/logEvent'); var _logEvent2 = _interopRequireDefault(_logEvent);
var _resolveNumericIdentifier = require('../integrations/g4flex/utils/resolveNumericIdentifier');
var _sequelize = require('sequelize');
var _database = require('../database'); var _database2 = _interopRequireDefault(_database);

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

    // Get entity data
    let filter = ''
    const getEntityData = async (codigo) => {
      const { identifierType, identifierValue } = _resolveNumericIdentifier.resolveNumericIdentifier.call(void 0, codigo);
      if (identifierType === 'customerId') {
        filter = `Codigo=${identifierValue}`
      } else if (identifierType === 'cpf') {
        filter = `CPFCNPJ=${identifierValue}`
      } else if (identifierType === 'cnpj') {
        filter = `CPFCNPJ=${identifierValue}`
      }
      const entity = await _EntityService2.default.loadEntityByFilter(filter)
      return entity;
    }
    const entityData = await getEntityData(data.customerIdentifier);

    // Get city data
    const cityData = await _CityService2.default.getCityByErpCode(_optionalChain([entityData, 'optionalAccess', _ => _.CodigoCidade]))


    const newRequest = await _workOrderWaitingQueue2.default.create({
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
      customerStreet: _optionalChain([entityData, 'optionalAccess', _2 => _2.Endereco]),
      customerNumber: _optionalChain([entityData, 'optionalAccess', _3 => _3.NumeroEndereco]),
      customerAddressComplement: _optionalChain([entityData, 'optionalAccess', _4 => _4.ComplementoEndereco]),
      customerNeighborhood: _optionalChain([entityData, 'optionalAccess', _5 => _5.Bairro]),
      customerCity: _optionalChain([cityData, 'optionalAccess', _6 => _6.full_name]),
      customerState: _optionalChain([cityData, 'optionalAccess', _7 => _7.acronym_federal_unit]),
      customerZipCode: _optionalChain([entityData, 'optionalAccess', _8 => _8.Cep]),
      customerCityErpCode: _optionalChain([entityData, 'optionalAccess', _9 => _9.CodigoCidade]),
      customerStreetTypeCode: _optionalChain([entityData, 'optionalAccess', _10 => _10.CodigoTipoLograd])
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
    // Tentar atualizar pelo número da ordem caso o uraRequestId não encontre registros
    const queue = await _workOrderWaitingQueue2.default.findOne({
      where: { orderNumber: uraRequestId }
    });

    if (queue) {
      const [updateCount] = await _workOrderWaitingQueue2.default.update(
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

 async function findByOrderNumber(orderNumber) {
  console.log('🔎 INIT findByOrderNumber', { orderNumber });

  if (!orderNumber) throw new Error('orderNumber is required');

  const result = await _workOrderWaitingQueue2.default.findOne({
    where: { orderNumber }
  });

  if (!result) {
    console.warn('⚠️ No record found in findByOrderNumber', { orderNumber });
  }

  return result;
} exports.findByOrderNumber = findByOrderNumber;

 async function findOldestWaitingOrder() {
  console.log('🔎 INIT findOldestWaitingOrder');

  const result = await _workOrderWaitingQueue2.default.findOne({
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
} exports.findOldestWaitingOrder = findOldestWaitingOrder;

 async function findOldestWaitingOrderNotEditing() {
  console.log('🔎 INIT findOldestWaitingOrderNotEditing');

  const result = await _workOrderWaitingQueue2.default.findOne({
    where: {
      status: 'WAITING_TECHNICIAN',
      [_sequelize.Op.or]: [
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
} exports.findOldestWaitingOrderNotEditing = findOldestWaitingOrderNotEditing;

 async function findById(id) {
  console.log('🔎 INIT findById', { id });

  if (!id) throw new Error('id is required');

  const result = await _workOrderWaitingQueue2.default.findByPk(id);

  if (!result) {
    console.warn('⚠️ No record found in findById', { id });
  }

  return result;
} exports.findById = findById;

 async function setEditingFlag(orderNumber, isEditing, editedBy = null) {
  console.log('🔧 INIT setEditingFlag', { orderNumber, isEditing, editedBy });

  if (!orderNumber) throw new Error('orderNumber is required');

  const updateData = {
    isEditing,
    editedAt: isEditing ? new Date() : null,
    editedBy: isEditing ? editedBy : null
  };

  const [affectedCount] = await _workOrderWaitingQueue2.default.update(updateData, {
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
} exports.setEditingFlag = setEditingFlag;

 async function isOrderBeingEdited(orderNumber) {
  console.log('🔎 INIT isOrderBeingEdited', { orderNumber });

  if (!orderNumber) throw new Error('orderNumber is required');

  const result = await _workOrderWaitingQueue2.default.findOne({
    where: { orderNumber },
    attributes: ['isEditing', 'editedAt']
  });

  if (!result) {
    console.warn('⚠️ No record found in isOrderBeingEdited', { orderNumber });
    return false;
  }

  return result.isEditing || false;
} exports.isOrderBeingEdited = isOrderBeingEdited;

 async function isOrderEditingExpired(orderNumber, maxEditDurationMs = 10 * 60 * 1000) {
  console.log('🔎 INIT isOrderEditingExpired', { orderNumber, maxEditDurationMs });

  if (!orderNumber) throw new Error('orderNumber is required');

  const result = await _workOrderWaitingQueue2.default.findOne({
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
} exports.isOrderEditingExpired = isOrderEditingExpired;

 async function hasAnyOrderBeingEdited() {
  console.log('🔎 INIT hasAnyOrderBeingEdited');

  const result = await _workOrderWaitingQueue2.default.findOne({
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
} exports.hasAnyOrderBeingEdited = hasAnyOrderBeingEdited;

exports. default = {
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
