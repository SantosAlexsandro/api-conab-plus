// src/integrations/g4flex/controllers/WorkOrderController.js

import WorkOrderService from "../services/WorkOrderService";
import {
  validateURAQuery,
  determineIdentifierType,
} from "../utils/uraValidator";
import { resolveNumericIdentifier } from "../utils/resolveNumericIdentifier";
import logEvent from "../../../utils/logEvent";

class WorkOrderController {
  async checkWorkOrder(req, res) {
    console.log("req.query", req.query);
    const validationError = validateURAQuery(req.query);

    let { customerIdentifier = "", uraRequestId = "" } = req.query;

    try {
      if (validationError) {
        await logEvent({
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

      const { cpf, cnpj, customerId } = resolveNumericIdentifier(customerIdentifier);

      const result = await WorkOrderService.checkWorkOrdersByCustomerId({
        cpf,
        cnpj,
        customerId,
        uraRequestId,
      });

      await logEvent({
        uraRequestId,
        source: "controller_g4flex",
        action: "work_order_check_success",
        payload: {
          customerIdentifier,
          identifierType: determineIdentifierType(customerIdentifier),
        },
        response: result,
        statusCode: 200,
        error: null,
      });

      return res.json(result);
    } catch (error) {
      await logEvent({
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
      const validationError = validateURAQuery(req.query);
      if (validationError) {
        await logEvent({
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

      const { cpf, cnpj, customerId } = resolveNumericIdentifier(customerIdentifier);

      const result = await WorkOrderService.closeWorkOrderByCustomerId({
        cpf,
        cnpj,
        customerId,
      });

      await logEvent({
        uraRequestId,
        source: "controller_g4flex",
        action: "work_order_close_success",
        payload: {
          customerIdentifier,
          identifierType: determineIdentifierType(customerIdentifier),
        },
        response: result,
        statusCode: 200,
        error: null,
      });

      return res.json(result);
    } catch (error) {
      await logEvent({
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

      const validationError = validateURAQuery(req.query);
      if (validationError) {
        await logEvent({
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

      const { cpf, cnpj, customerId } = resolveNumericIdentifier(customerIdentifier);

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

      await logEvent({
        uraRequestId,
        source: "controller_g4flex",
        action: "work_order_request_success",
        payload: {
          customerIdentifier,
          identifierType: determineIdentifierType(customerIdentifier),
          ...req.body,
        },
        response,
        statusCode: 200,
        error: null,
      });

      res.status(200).json(response);

      // Process the work order asynchronously
      WorkOrderService.createWorkOrder({
        uraRequestId,
        cpf,
        cnpj,
        customerId,
        productId,
        requesterNameAndPosition,
        IncidentAndReceiverName,
        requesterWhatsApp,
      }).catch((error) => {
        console.error("Error processing work order:", error);
        logEvent({
          uraRequestId,
          source: "controller_g4flex",
          action: "work_order_create_processing_error",
          payload: { customerIdentifier, ...req.body },
          response: { error: error.message },
          statusCode: 500,
          error: error.message,
        }).catch((logError) => {
          console.error("Error logging event:", logError);
        });
      });
    } catch (error) {
      await logEvent({
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

export default new WorkOrderController();
