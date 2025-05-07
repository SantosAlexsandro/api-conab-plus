// src/integrations/g4flex/controllers/WorkOrderController.js

import WorkOrderService from "../services/WorkOrderService";
import EntityService from "../services/EntityService";
import {
  validateURAQuery,
  determineIdentifierType,
} from "../utils/uraValidator";
import { resolveNumericIdentifier } from "../utils/resolveNumericIdentifier";
import logEvent from "../../../utils/logEvent";
import workOrderQueue from "../queues/workOrder.queue";

class WorkOrderController {
  async getOpenOrders(req, res) {
    console.log("req.query", req.query);
    const validationError = validateURAQuery(req.query);

    let { customerIdentifier = "", uraRequestId = "" } = req.query;

    try {
      if (validationError) {
        await logEvent({
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

      const { identifierType, identifierValue } = resolveNumericIdentifier(customerIdentifier);

      const result = await WorkOrderService.getOpenOrdersByCustomerId({
        identifierType,
        identifierValue,
        uraRequestId
      });

      await logEvent({
        uraRequestId,
        source: "g4flex",
        action: "work_order_get_success",
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
      await logEvent({
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

  // Fechar Ordem de Serviço
  async closeWorkOrder(req, res) {
    let { customerIdentifier = "", uraRequestId = "" } = req.query;
    const { requesterName, requesterPosition, cancellationReason } = req.body;

    try {
      const validationError = validateURAQuery(req.query);
      if (validationError) {
        await logEvent({
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

      // Validação dos campos obrigatórios do body
      if (!requesterName || !requesterPosition || !cancellationReason) {
        const missingFields = [];
        if (!requesterName) missingFields.push('requesterName');
        if (!requesterPosition) missingFields.push('requesterPosition');
        if (!cancellationReason) missingFields.push('cancellationReason');
        const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
        await logEvent({
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

      const { identifierType, identifierValue } = resolveNumericIdentifier(customerIdentifier);

      const result = await WorkOrderService.closeWorkOrderByCustomerId({
        identifierType,
        identifierValue,
        uraRequestId,
        requesterName,
        requesterPosition,
        cancellationReason
      });

      await logEvent({
        uraRequestId,
        source: "g4flex",
        action: "work_order_close_success",
        payload: {
          customerIdentifier,
          identifierType,
          requesterName,
          requesterPosition,
          cancellationReason
        },
        response: result,
        statusCode: 200,
        error: null,
      });

      return res.json(result);
    } catch (error) {
      await logEvent({
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

    try {
      const {
        productId,
        requesterNameAndPosition,
        IncidentAndReceiverName,
        requesterWhatsApp,
      } = req.body;

      const validationError = validateURAQuery(req.query);
      if (validationError) {
        await logEvent({
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

      const { identifierType, identifierValue } = resolveNumericIdentifier(customerIdentifier);
      console.log("identifierType", identifierType);
      console.log("identifierValue", identifierValue);

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
        await logEvent({
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
      const customerData = await EntityService.getCustomerByIdentifier(identifierType, identifierValue);
      const customerName = customerData.nome;

      // Adicionar à fila de criação de ordem de serviço
      await workOrderQueue.add('createWorkOrder', {
        uraRequestId,
        identifierType,
        identifierValue,
        customerName,
        productId,
        requesterNameAndPosition,
        IncidentAndReceiverName,
        requesterWhatsApp,
      });

      console.log('[WorkOrderController] Ordem adicionada à fila para processamento');

      // Preparar e enviar resposta após a lógica completa
      const response = {
        success: true,
        message: "Solicitação de criação de Ordem de Serviço realizada com sucesso.",
      };

      await logEvent({
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
      await logEvent({
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

export default new WorkOrderController();
