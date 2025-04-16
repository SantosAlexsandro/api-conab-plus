"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/integrations/g4flex/controllers/WorkOrderController.js

var _WorkOrderService = require('../services/WorkOrderService'); var _WorkOrderService2 = _interopRequireDefault(_WorkOrderService);



var _uraValidator = require('../utils/uraValidator');
var _resolveNumericIdentifier = require('../utils/resolveNumericIdentifier');
var _logEvent = require('../../../utils/logEvent'); var _logEvent2 = _interopRequireDefault(_logEvent);
var _workOrderqueue = require('../queues/workOrder.queue'); var _workOrderqueue2 = _interopRequireDefault(_workOrderqueue);

class WorkOrderController {
  async checkWorkOrder(req, res) {
    console.log("req.query", req.query);
    const validationError = _uraValidator.validateURAQuery.call(void 0, req.query);

    let { customerIdentifier = "", uraRequestId = "" } = req.query;

    try {
      if (validationError) {
        await _logEvent2.default.call(void 0, {
          uraRequestId,
          source: "controller_g4flex",
          action: "work_order_check_validation_error",
          payload: req.query,
          response: { error: validationError },
          statusCode: 400,
          error: validationError,
        });
        return res.status(400).json({ error: validationError });
      }

      const { cpf, cnpj, customerId } = _resolveNumericIdentifier.resolveNumericIdentifier.call(void 0, customerIdentifier);

      const result = await _WorkOrderService2.default.checkWorkOrdersByCustomerId({
        cpf,
        cnpj,
        customerId,
        uraRequestId,
      });

      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: "controller_g4flex",
        action: "work_order_check_success",
        payload: {
          customerIdentifier,
          identifierType: _uraValidator.determineIdentifierType.call(void 0, customerIdentifier),
        },
        response: result,
        statusCode: 200,
        error: null,
      });

      return res.json(result);
    } catch (error) {
      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: "controller_g4flex",
        action: "work_order_check_error",
        payload: req.query,
        response: { error: error.message },
        statusCode: 500,
        error: error.message,
      });

      console.error("Error checking work orders:", error);
      return res.status(500).json({
        error: error.message || "Error checking work orders",
      });
    }
  }

  // Fechar Ordem de Serviço
  async closeWorkOrder(req, res) {
    let { customerIdentifier = "", uraRequestId = "" } = req.query;

    try {
      const validationError = _uraValidator.validateURAQuery.call(void 0, req.query);
      if (validationError) {
        await _logEvent2.default.call(void 0, {
          uraRequestId,
          source: "controller_g4flex",
          action: "work_order_close_validation_error",
          payload: req.query,
          response: { error: validationError },
          statusCode: 400,
          error: validationError,
        });
        return res.status(400).json({ error: validationError });
      }

      const { cpf, cnpj, customerId } = _resolveNumericIdentifier.resolveNumericIdentifier.call(void 0, customerIdentifier);

      const result = await _WorkOrderService2.default.closeWorkOrderByCustomerId({
        cpf,
        cnpj,
        customerId,
      });

      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: "controller_g4flex",
        action: "work_order_close_success",
        payload: {
          customerIdentifier,
          identifierType: _uraValidator.determineIdentifierType.call(void 0, customerIdentifier),
        },
        response: result,
        statusCode: 200,
        error: null,
      });

      return res.json(result);
    } catch (error) {
      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: "controller_g4flex",
        action: "work_order_close_controller_error",
        payload: req.query,
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

  // Criar Ordem de Serviço
  async createWorkOrder(req, res) {
    let { customerIdentifier = "", uraRequestId = "" } = req.query;

    try {
      const {
        productId,
        requesterNameAndPosition,
        IncidentAndReceiverName,
        requesterWhatsApp,
      } = req.body;

      const validationError = _uraValidator.validateURAQuery.call(void 0, req.query);
      if (validationError) {
        await _logEvent2.default.call(void 0, {
          uraRequestId,
          source: "controller_g4flex",
          action: "work_order_create_validation_error",
          payload: req.query,
          response: { error: validationError },
          statusCode: 400,
          error: validationError,
        });
        return res.status(400).json({ error: validationError });
      }

      const { cpf, cnpj, customerId } = _resolveNumericIdentifier.resolveNumericIdentifier.call(void 0, customerIdentifier);

      // Validate required fields
      const requiredFields = {
        productId,
        requesterNameAndPosition,
        IncidentAndReceiverName,
        requesterWhatsApp,
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        await _logEvent2.default.call(void 0, {
          uraRequestId,
          source: "controller_g4flex",
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

      // Return success response
      const response = {
        success: true,
        message:
          "Solicitação de criação de Ordem de Serviço realizada com sucessso.",
      };

      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: "controller_g4flex",
        action: "work_order_request_success",
        payload: {
          customerIdentifier,
          identifierType: _uraValidator.determineIdentifierType.call(void 0, customerIdentifier),
          ...req.body,
        },
        response,
        statusCode: 200,
        error: null,
      });

      res.status(200).json(response);

      // Adicionar à fila de criação de ordem de serviço
      await _workOrderqueue2.default.add('createWorkOrder', {
        uraRequestId,
        cpf,
        cnpj,
        customerId,
        productId,
        requesterNameAndPosition,
        IncidentAndReceiverName,
        requesterWhatsApp,
      });

      console.log('[WorkOrderController] Ordem adicionada à fila para processamento');
    } catch (error) {
      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: "controller_g4flex",
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
