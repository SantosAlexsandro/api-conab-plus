// src/integrations/g4flex/controllers/WorkOrderController.js

import WorkOrderService from "../services/WorkOrderService";
import EntityService from "../services/EntityService";
import {
  validateURAQuery,
  validateURAFailureQuery,
  determineIdentifierType,
} from "../utils/uraValidator";
import { resolveNumericIdentifier } from "../utils/resolveNumericIdentifier";
import logEvent from "../../../utils/logEvent";
import workOrderQueue from "../queues/workOrder.queue";
import WorkOrderWaitingQueue from "../../../models/workOrderWaitingQueue";

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

  // Registra falha da URA
  async handleRequestFailures(req, res) {
    // Pega uraRequestId dos query params e customerIdentifier do payload (body)
    let { uraRequestId = "" } = req.query;
    let { customerIdentifier = "" } = req.body;

    // Em ambiente de desenvolvimento, gerar automaticamente uraRequestId se não fornecido
    if (!uraRequestId && process.env.NODE_ENV === 'development') {
      uraRequestId = `dev-${Math.floor(Math.random() * 1000000)}`;
      console.log(`[DESENVOLVIMENTO] Gerado ID URA aleatório: ${uraRequestId}`);
    }

    try {
      // Usa validação específica para falhas da URA (customerIdentifier opcional)
      const validationError = validateURAFailureQuery({ customerIdentifier, uraRequestId });
      if (validationError) {
        await logEvent({
          uraRequestId,
          source: 'g4flex',
          action: 'ura_failure_validation_error',
          payload: { customerIdentifier, uraRequestId, ...req.body },
          response: { error: validationError },
          statusCode: 400,
          error: validationError,
        });
        return res.status(400).json({ error: validationError });
      }

      // Validação de campo obrigatório: requesterContact
      const { requesterContact } = req.body;
      if (!requesterContact) {
        const errorMsg = 'Missing required field: requesterContact';
        await logEvent({
          uraRequestId,
          source: 'g4flex',
          action: 'ura_failure_validation_error',
          payload: { customerIdentifier, uraRequestId, ...req.body },
          response: { error: errorMsg },
          statusCode: 400,
          error: errorMsg,
        });
        return res.status(400).json({ error: errorMsg });
      }

      // Resolve o identificador apenas se customerIdentifier foi fornecido
      let identifierType = null;
      let identifierValue = null;

      if (customerIdentifier) {
        const resolved = resolveNumericIdentifier(customerIdentifier);
        identifierType = resolved.identifierType;
        identifierValue = resolved.identifierValue;
      }

      // Verifica se já existe uma solicitação com este uraRequestId
      const existingRequest = await WorkOrderWaitingQueue.findOne({
        where: { uraRequestId }
      });

      if (existingRequest) {
        await logEvent({
          uraRequestId,
          source: 'g4flex',
          action: 'ura_failure_duplicate_request',
          payload: { customerIdentifier, uraRequestId, ...req.body },
          response: { error: 'Request already exists' },
          statusCode: 409,
          error: 'Duplicate request'
        });
        return res.status(409).json({ error: 'A request with this ID already exists' });
      }

      // Cria novo registro na fila com status URA_FAILURE
      const newRequest = await WorkOrderWaitingQueue.create({
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

      await logEvent({
        uraRequestId,
        source: 'g4flex',
        action: 'ura_failure_registered',
        payload: { customerIdentifier, uraRequestId, ...req.body },
        response: { queueId: newRequest.id },
        statusCode: 201
      });

      return res.status(201).json({
        success: true,
        message: 'URA failure registered successfully',
        request: newRequest
      });

    } catch (error) {
      await logEvent({
        uraRequestId,
        source: 'g4flex',
        action: 'ura_failure_error',
        payload: { customerIdentifier, uraRequestId, ...req.body },
        response: { error: error.message },
        statusCode: 500,
        error: error.message
      });

      console.error('Error registering URA failure:', error);
      return res.status(500).json({
        error: error.message || 'Error registering URA failure'
      });
    }
  }
}

export default new WorkOrderController();
