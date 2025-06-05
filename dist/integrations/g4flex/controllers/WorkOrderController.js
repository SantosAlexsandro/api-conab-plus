"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/integrations/g4flex/controllers/WorkOrderController.js

var _WorkOrderService = require('../services/WorkOrderService'); var _WorkOrderService2 = _interopRequireDefault(_WorkOrderService);
var _CustomerService = require('../services/CustomerService'); var _CustomerService2 = _interopRequireDefault(_CustomerService);
var _uraValidator = require('../utils/uraValidator');
var _resolveNumericIdentifier = require('../utils/resolveNumericIdentifier');
var _logEvent = require('../../../utils/logEvent'); var _logEvent2 = _interopRequireDefault(_logEvent);
var _workOrderqueue = require('../queues/workOrder.queue'); var _workOrderqueue2 = _interopRequireDefault(_workOrderqueue);
var _workOrderWaitingQueue = require('../../../models/workOrderWaitingQueue'); var _workOrderWaitingQueue2 = _interopRequireDefault(_workOrderWaitingQueue);
var _WorkOrderWaitingQueueService = require('../../../services/WorkOrderWaitingQueueService'); var _WorkOrderWaitingQueueService2 = _interopRequireDefault(_WorkOrderWaitingQueueService);
var _WhatsAppService = require('../services/WhatsAppService'); var _WhatsAppService2 = _interopRequireDefault(_WhatsAppService);

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

      // Se o cliente possui ordens abertas, enviar notificação via WhatsApp
      if (result.customerHasOpenOrders && result.orders.length > 0) {
        try {
          // Pegar o número da primeira ordem encontrada
          const firstOrderNumber = result.orders[0].number;

          // Buscar dados da fila de espera usando o número da ordem
          const queueData = await _WorkOrderWaitingQueueService2.default.findByOrderNumber(firstOrderNumber);

          if (queueData && queueData.requesterContact) {
            await _WhatsAppService2.default.sendWhatsAppMessage({
              phoneNumber: queueData.requesterContact,
              workOrderId: firstOrderNumber,
              customerName: queueData.entityName,
              feedback: 'existing_order_found',
              uraRequestId: queueData.uraRequestId || uraRequestId
            });

            console.log(`📱 WhatsApp enviado para cliente ${queueData.entityName} sobre ordem existente ${firstOrderNumber}`);
          } else {
            console.log(`⚠️ Não foi possível enviar WhatsApp: dados da ordem ${firstOrderNumber} não encontrados na fila ou sem contato`);
          }
        } catch (whatsappError) {
          console.error('❌ Erro ao enviar WhatsApp sobre ordem existente:', whatsappError);
          // Não propagar o erro para não afetar a resposta da consulta
        }
      }

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
        callerPhoneNumber,
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
      const customerData = await _CustomerService2.default.getCustomerByIdentifier(identifierType, identifierValue);
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
        callerPhoneNumber,
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
}

exports. default = new WorkOrderController();
