"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/integrations/g4flex/controllers/WorkOrderController.js

var _WorkOrderService = require('../services/WorkOrderService'); var _WorkOrderService2 = _interopRequireDefault(_WorkOrderService);
var _EntityService = require('../services/EntityService'); var _EntityService2 = _interopRequireDefault(_EntityService);




var _uraValidator = require('../utils/uraValidator');
var _resolveNumericIdentifier = require('../utils/resolveNumericIdentifier');
var _logEvent = require('../../../utils/logEvent'); var _logEvent2 = _interopRequireDefault(_logEvent);
var _workOrderqueue = require('../queues/workOrder.queue'); var _workOrderqueue2 = _interopRequireDefault(_workOrderqueue);
var _workOrderWaitingQueue = require('../../../models/workOrderWaitingQueue'); var _workOrderWaitingQueue2 = _interopRequireDefault(_workOrderWaitingQueue);

class WorkOrderController {
  async getOpenOrdersByCustomerId(req, res) {
    let { customerIdentifier = "", uraRequestId = "" } = req.query;

    // Em ambiente de desenvolvimento, gerar automaticamente uraRequestId se não fornecido
    if (!uraRequestId && process.env.NODE_ENV === 'development') {
      // Gerando um ID aleatório usando random
      uraRequestId = `dev-${Math.floor(Math.random() * 1000000)}`;
      req.query.uraRequestId = uraRequestId;
      console.log(`[DESENVOLVIMENTO] Gerado ID URA aleatório: ${uraRequestId}`);
    }

    try {
      const validationError = _uraValidator.validateURAQuery.call(void 0, req.query);
      if (validationError) {
        await _logEvent2.default.call(void 0, {
          uraRequestId,
          source: "g4flex",
          action: "work_order_get_validation_error",
          payload: req.query,
          response: { error: validationError },
          statusCode: 400,
          error: validationError,
        });
        return res.status(400).json({ error: validationError });
      }

      const { identifierType, identifierValue } = _resolveNumericIdentifier.resolveNumericIdentifier.call(void 0, customerIdentifier);

      const result = await _WorkOrderService2.default.getOpenOrdersByCustomerId({
        identifierType,
        identifierValue,
        uraRequestId
      });

      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: "g4flex",
        action: "get_open_orders_by_customer_id",
        payload: {
          customerIdentifier,
          identifierType,
        },
        response: result,
        statusCode: 200,
        error: null,
      });

      return res.json(result);
    } catch (error) {
      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: "g4flex",
        action: "work_order_get_error",
        payload: req.query,
        response: { error: error.message },
        statusCode: 500,
        error: error.message,
      });

      console.error("Error getting open work orders:", error);
      return res.status(500).json({
        error: error.message || "Error getting open work orders",
      });
    }
  }

  // Cancela Ordem de Serviço
  async closeWorkOrder(req, res) {
    let { customerIdentifier = "", uraRequestId = "" } = req.query;
    const { cancellationRequesterInfo } = req.body;

    // Em ambiente de desenvolvimento, gerar automaticamente uraRequestId se não fornecido
    if (!uraRequestId && process.env.NODE_ENV === 'development') {
      // Gerando um ID aleatório usando random
      uraRequestId = `dev-${Math.floor(Math.random() * 1000000)}`;
      req.query.uraRequestId = uraRequestId;
      console.log(`[DESENVOLVIMENTO] Gerado ID URA aleatório: ${uraRequestId}`);
    }

    try {
      const validationError = _uraValidator.validateURAQuery.call(void 0, req.query);
      if (validationError) {
        await _logEvent2.default.call(void 0, {
          uraRequestId,
          source: "g4flex",
          action: "work_order_close_validation_error",
          payload: req.query,
          response: { error: validationError },
          statusCode: 400,
          error: validationError,
        });
        return res.status(400).json({ error: validationError });
      }

      // Validação do campo obrigatório do body
      if (!cancellationRequesterInfo) {
        const errorMsg = 'Missing required field: cancellationRequesterInfo';
        await _logEvent2.default.call(void 0, {
          uraRequestId,
          source: "g4flex",
          action: "work_order_close_validation_error",
          payload: { ...req.query, ...req.body },
          response: { error: errorMsg },
          statusCode: 400,
          error: errorMsg,
        });
        return res.status(400).json({ error: errorMsg });
      }

      const { identifierType, identifierValue } = _resolveNumericIdentifier.resolveNumericIdentifier.call(void 0, customerIdentifier);

      // Adicionar à fila de cancelamento de ordem de serviço
      await _workOrderqueue2.default.add('cancelWorkOrder', {
        uraRequestId,
        identifierType,
        identifierValue,
        cancellationRequesterInfo
      });

      console.log('[WorkOrderController] Cancelamento adicionado à fila para processamento');

      // Preparar e enviar resposta
      const response = {
        success: true,
        message: "Work order cancellation request successfully submitted.",
      };

      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: "g4flex",
        action: "work_order_close_success",
        payload: {
          customerIdentifier,
          identifierType,
          cancellationRequesterInfo
        },
        response,
        statusCode: 200,
        error: null,
      });

      return res.json(response);
    } catch (error) {
      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: "g4flex",
        action: "work_order_close_controller_error",
        payload: { ...req.query, ...req.body },
        response: { error: error.message },
        statusCode: 500,
        error: error.message,
      });

      console.error("Error closing work order:", error);
      return res.status(500).json({
        error: error.message || "Error closing work order",
      });
    }
  }

  // Solicita Ordem de Serviço
  async requestWorkOrder(req, res) {
    let { customerIdentifier = "", uraRequestId = "" } = req.query;

    // Em ambiente de desenvolvimento, gerar automaticamente uraRequestId se não fornecido
    if (!uraRequestId && process.env.NODE_ENV === 'development') {
      // Gerando um ID aleatório usando random
      uraRequestId = `dev-${Math.floor(Math.random() * 1000000)}`;
      req.query.uraRequestId = uraRequestId;
      console.log(`[DESENVOLVIMENTO] Gerado ID URA aleatório: ${uraRequestId}`);
    }

    try {
      const {
        productId,
        requesterNameAndPosition,
        incidentAndReceiverName,
        requesterContact,
      } = req.body;

      const validationError = _uraValidator.validateURAQuery.call(void 0, req.query);
      if (validationError) {
        await _logEvent2.default.call(void 0, {
          uraRequestId,
          source: "g4flex",
          action: "work_order_create_validation_error",
          payload: req.query,
          response: { error: validationError },
          statusCode: 400,
          error: validationError,
        });
        return res.status(400).json({ error: validationError });
      }

      const { identifierType, identifierValue } = _resolveNumericIdentifier.resolveNumericIdentifier.call(void 0, customerIdentifier);

      // Validate required fields
      const requiredFields = {
        productId,
        requesterNameAndPosition,
        incidentAndReceiverName,
        requesterContact,
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        await _logEvent2.default.call(void 0, {
          uraRequestId,
          source: "g4flex",
          action: "work_order_create_validation_error",
          payload: { ...req.body, ...req.query },
          response: {
            error: `Missing required fields: ${missingFields.join(", ")}`,
          },
          statusCode: 400,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        });
        return res.status(400).json({
          error: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      // Busca dados do cliente usando o método otimizado
      const customerData = await _EntityService2.default.getCustomerByIdentifier(identifierType, identifierValue);
      const customerName = customerData.nome;

      const openOrders = await _WorkOrderService2.default.getOpenOrdersByCustomerId({
        identifierType,
        identifierValue,
        uraRequestId
      });

      console.log("openOrders", openOrders);

      if (openOrders.orders.length > 0) {
        await _logEvent2.default.call(void 0, {
          uraRequestId,
          source: "g4flex",
          action: "work_order_create_validation_error",
          payload: { ...req.body, ...req.query },
          response: { error: "Customer already has open work orders", openOrders: openOrders.orders },
          statusCode: 400,
          error: "Customer already has open work orders",
        });
        return res.status(400).json({ error: "Customer already has open work orders" });
      }

      // Adicionar à fila de criação de ordem de serviço
      await _workOrderqueue2.default.add('createWorkOrder', {
        uraRequestId,
        identifierType,
        identifierValue,
        customerName,
        productId,
        requesterNameAndPosition,
        incidentAndReceiverName,
        requesterContact,
      });

      console.log('[WorkOrderController] Ordem adicionada à fila para processamento');

      // Preparar e enviar resposta após a lógica completa
      const response = {
        success: true,
        message: "Work order creation request successfully submitted.",
      };

      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: "g4flex",
        action: "work_order_request_success",
        payload: {
          customerIdentifier,
          identifierType,
          ...req.body,
        },
        response,
        statusCode: 200,
        error: null,
      });

      return res.status(200).json(response);
    } catch (error) {
      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: "g4flex",
        action: "work_order_create_controller_error",
        payload: { ...req.query, ...req.body },
        response: { error: error.message },
        statusCode: 500,
        error: error.message,
      });

      console.error("Error handling work order request:", error);
      return res.status(500).json({
        error: error.message || "Error handling work order request",
      });
    }
  }

  // Registra falha da URA
  async handleUraFailure(req, res) {
    // Pega uraRequestId dos query params e customerIdentifier pode vir de ambos
    let { uraRequestId = '' } = req.query;
    let { customerIdentifier = '' } = { ...req.query, ...req.body };

    // Em ambiente de desenvolvimento, gerar automaticamente uraRequestId se não fornecido
    if (!uraRequestId && process.env.NODE_ENV === 'development') {
      uraRequestId = `dev-${Math.floor(Math.random() * 1000000)}`;
      console.log(`[DESENVOLVIMENTO] Gerado ID URA aleatório: ${uraRequestId}`);
    }

    try {
      // Usa validação específica para falhas da URA (customerIdentifier opcional)
      const validationError = _uraValidator.validateURAFailureQuery.call(void 0, { ...req.query, ...req.body });
      if (validationError) {
        await _logEvent2.default.call(void 0, {
          uraRequestId,
          source: 'g4flex',
          action: 'ura_failure_validation_error',
          payload: req.body, // Só o body no payload
          response: { error: validationError },
          statusCode: 400,
          error: validationError,
        });
        return res.status(400).json({ error: validationError });
      }

      // Resolve o identificador apenas se customerIdentifier foi fornecido
      let identifierType = null;
      let identifierValue = null;

      if (customerIdentifier) {
        const resolved = _resolveNumericIdentifier.resolveNumericIdentifier.call(void 0, customerIdentifier);
        identifierType = resolved.identifierType;
        identifierValue = resolved.identifierValue;
      }

      // Verifica se já existe uma solicitação com este uraRequestId
      const existingRequest = await _workOrderWaitingQueue2.default.findOne({
        where: { uraRequestId }
      });

      if (existingRequest) {
        await _logEvent2.default.call(void 0, {
          uraRequestId,
          source: 'g4flex',
          action: 'ura_failure_duplicate_request',
          payload: req.body, // Só o body no payload
          response: { error: 'Solicitação já existe' },
          statusCode: 409,
          error: 'Duplicate request'
        });
        return res.status(409).json({ error: 'Uma solicitação com este ID já existe' });
      }

      // Cria novo registro na fila com status URA_FAILURE
      const newRequest = await _workOrderWaitingQueue2.default.create({
        customerIdentifier: identifierValue, // Pode ser null se não fornecido
        uraRequestId,
        status: 'URA_FAILURE',
        source: 'g4flex',
        productId: req.body.productId,
        requesterNameAndPosition: req.body.requesterNameAndPosition,
        incidentAndReceiverName: req.body.incidentAndReceiverName,
        requesterContact: req.body.requesterContact,
        cancellationRequesterInfo: req.body.cancellationRequesterInfo,
        failureReason: req.body.failureReason,
        priority: 'high' // Falhas da URA são tratadas com prioridade alta
      });

      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: 'g4flex',
        action: 'ura_failure_registered',
        payload: req.body, // Só o body no payload
        response: { queueId: newRequest.id },
        statusCode: 201
      });

      return res.status(201).json({
        success: true,
        message: 'Falha da URA registrada com sucesso',
        request: newRequest
      });

    } catch (error) {
      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: 'g4flex',
        action: 'ura_failure_error',
        payload: req.body, // Só o body no payload
        response: { error: error.message },
        statusCode: 500,
        error: error.message
      });

      console.error('Erro ao registrar falha da URA:', error);
      return res.status(500).json({
        error: error.message || 'Erro ao registrar falha da URA'
      });
    }
  }
}

exports. default = new WorkOrderController();
