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
      const validationError = validateURAQuery(req.query);
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

      // Validação do campo obrigatório do body
      if (!cancellationRequesterInfo) {
        const errorMsg = 'Missing required field: cancellationRequesterInfo';
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

      // Adicionar à fila de cancelamento de ordem de serviço
      await workOrderQueue.add('cancelWorkOrder', {
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

      await logEvent({
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

      const openOrders = await WorkOrderService.getOpenOrdersByCustomerId({
        identifierType,
        identifierValue,
        uraRequestId
      });

      console.log("openOrders", openOrders);

      if (openOrders.orders.length > 0) {
        await logEvent({
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
      await workOrderQueue.add('createWorkOrder', {
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
