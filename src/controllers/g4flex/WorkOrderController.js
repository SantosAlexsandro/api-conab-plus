import WorkOrderService from '../../services/g4flex/WorkOrderService';
import { validateURAQuery, determineIdentifierType } from '../../utils/g4flex/validator/uraValidator';
import { formatCustomerId, formatCPF, formatCNPJ } from '../../utils/string/formatUtils';
import logEvent from '../../utils/logEvent';

class WorkOrderController {

  async checkWorkOrder(req, res) {
    console.log('req.query', req.query);
    const validationError = validateURAQuery(req.query);

    let { customerIdentifier = '', uraRequestId = '' } = req.query;
    let cpf = null;
    let cnpj = null;
    let customerId = null;

    try {

      if (validationError) {
        await logEvent({
          uraRequestId,
          source: 'controller_g4flex',
          action: 'work_order_check_validation_error',
          payload: req.query,
          response: { error: validationError },
          statusCode: 400,
          error: validationError
        });
        return res.status(400).json({ error: validationError });
      }

      // Determina o tipo de identificador e formata adequadamente
      if (customerIdentifier) {
        const identifierType = determineIdentifierType(customerIdentifier);

        if (!identifierType) {
          await logEvent({
            uraRequestId,
            source: 'controller_g4flex',
            action: 'work_order_check_validation_error',
            payload: req.query,
            response: { error: 'Invalid customer identifier format' },
            statusCode: 400,
            error: 'Invalid customer identifier format'
          });
          return res.status(400).json({ error: 'Invalid customer identifier format' });
        }

        if (identifierType === 'CPF') {
          const formatted = formatCPF(customerIdentifier);
          if (!formatted) {
            await logEvent({
              uraRequestId,
              source: 'controller_g4flex',
              action: 'work_order_check_validation_error',
              payload: req.query,
              response: { error: 'Invalid CPF' },
              statusCode: 400,
              error: 'Invalid CPF'
            });
            return res.status(400).json({ error: 'Invalid CPF' });
          }
          cpf = formatted;
        } else if (identifierType === 'CNPJ') {
          const formatted = formatCNPJ(customerIdentifier);
          if (!formatted) {
            await logEvent({
              uraRequestId,
              source: 'controller_g4flex',
              action: 'work_order_check_validation_error',
              payload: req.query,
              response: { error: 'Invalid CNPJ' },
              statusCode: 400,
              error: 'Invalid CNPJ'
            });
            return res.status(400).json({ error: 'Invalid CNPJ' });
          }
          cnpj = formatted;
        } else if (identifierType === 'CUSTOMER_ID') {
          const formatted = formatCustomerId(customerIdentifier);
          if (!formatted) {
            await logEvent({
              uraRequestId,
              source: 'controller_g4flex',
              action: 'work_order_check_validation_error',
              payload: req.query,
              response: { error: 'Invalid Customer ID' },
              statusCode: 400,
              error: 'Invalid Customer ID'
            });
            return res.status(400).json({ error: 'Invalid Customer ID' });
          }
          customerId = formatted;
        }
      }

      const result = await WorkOrderService.checkWorkOrdersByCustomerId({
        cpf,
        cnpj,
        customerId,
        uraRequestId
      });

      await logEvent({
        uraRequestId,
        source: 'controller_g4flex',
        action: 'work_order_check_success',
        payload: { customerIdentifier, identifierType: determineIdentifierType(customerIdentifier) },
        response: result,
        statusCode: 200,
        error: null
      });

      return res.json(result);
    } catch (error) {

      await logEvent({
        uraRequestId,
        source: 'controller_g4flex',
        action: 'work_order_check_error',
        payload: req.query,
        response: { error: error.message },
        statusCode: 500,
        error: error.message
      });

      console.error('Error checking work orders:', error);
      return res.status(500).json({
        error: error.message || 'Error checking work orders'
      });
    }
  }

  async closeWorkOrder(req, res) {
    let { customerIdentifier = '', uraRequestId = '' } = req.query;
    let cpf = null;
    let cnpj = null;
    let customerId = null;

    try {
      // Validação inicial do uraRequestId
      if (!uraRequestId) {
        return res.status(400).json({ error: 'URA request ID is required' });
      }

      const validationError = validateURAQuery(req.query);
      if (validationError) {
        await logEvent({
          uraRequestId,
          source: 'controller_g4flex',
          action: 'work_order_close_validation_error',
          payload: req.query,
          response: { error: validationError },
          statusCode: 400,
          error: validationError
        });
        return res.status(400).json({ error: validationError });
      }

      // Determina o tipo de identificador e formata adequadamente
      if (customerIdentifier) {
        const identifierType = determineIdentifierType(customerIdentifier);

        if (!identifierType) {
          await logEvent({
            uraRequestId,
            source: 'controller_g4flex',
            action: 'work_order_close_validation_error',
            payload: req.query,
            response: { error: 'Invalid customer identifier format' },
            statusCode: 400,
            error: 'Invalid customer identifier format'
          });
          return res.status(400).json({ error: 'Invalid customer identifier format' });
        }

        if (identifierType === 'CPF') {
          const formatted = formatCPF(customerIdentifier);
          if (!formatted) {
            await logEvent({
              uraRequestId,
              source: 'controller_g4flex',
              action: 'work_order_close_validation_error',
              payload: req.query,
              response: { error: 'Invalid CPF' },
              statusCode: 400,
              error: 'Invalid CPF'
            });
            return res.status(400).json({ error: 'Invalid CPF' });
          }
          cpf = formatted;
        } else if (identifierType === 'CNPJ') {
          const formatted = formatCNPJ(customerIdentifier);
          if (!formatted) {
            await logEvent({
              uraRequestId,
              source: 'controller_g4flex',
              action: 'work_order_close_validation_error',
              payload: req.query,
              response: { error: 'Invalid CNPJ' },
              statusCode: 400,
              error: 'Invalid CNPJ'
            });
            return res.status(400).json({ error: 'Invalid CNPJ' });
          }
          cnpj = formatted;
        } else if (identifierType === 'CUSTOMER_ID') {
          const formatted = formatCustomerId(customerIdentifier);
          if (!formatted) {
            await logEvent({
              uraRequestId,
              source: 'controller_g4flex',
              action: 'work_order_close_validation_error',
              payload: req.query,
              response: { error: 'Invalid Customer ID' },
              statusCode: 400,
              error: 'Invalid Customer ID'
            });
            return res.status(400).json({ error: 'Invalid Customer ID' });
          }
          customerId = formatted;
        }
      }

      const result = await WorkOrderService.closeWorkOrderByCustomerId({ cpf, cnpj, customerId });

      await logEvent({
        uraRequestId,
        source: 'controller_g4flex',
        action: 'work_order_close_success',
        payload: { customerIdentifier, identifierType: determineIdentifierType(customerIdentifier) },
        response: result,
        statusCode: 200,
        error: null
      });

      return res.json(result);
    } catch (error) {

      await logEvent({
        uraRequestId,
        source: 'controller_g4flex',
        action: 'work_order_close_controller_error',
        payload: req.query,
        response: { error: error.message },
        statusCode: 500,
        error: error.message
      });

      console.error('Error closing work order:', error);
      return res.status(500).json({
        error: error.message || 'Error closing work order'
      });
    }
  }

  async createWorkOrder(req, res) {
    let { customerIdentifier = '', uraRequestId = '' } = req.query;
    let cpf = null;
    let cnpj = null;
    let customerId = null;

    try {
      const {
        productId,
        requesterName,
        requesterPosition,
        incidentDescription,
        siteContactPerson,
        requesterWhatsApp
      } = req.body;

      // Validação inicial do uraRequestId
      if (!uraRequestId) {
        return res.status(400).json({ error: 'URA request ID is required' });
      }

      const validationError = validateURAQuery(req.query);
      if (validationError) {
        await logEvent({
          uraRequestId,
          source: 'controller_g4flex',
          action: 'work_order_create_validation_error',
          payload: req.query,
          response: { error: validationError },
          statusCode: 400,
          error: validationError
        });
        return res.status(400).json({ error: validationError });
      }

      // Determina o tipo de identificador e formata adequadamente
      if (customerIdentifier) {
        const identifierType = determineIdentifierType(customerIdentifier);

        if (!identifierType) {
          await logEvent({
            uraRequestId,
            source: 'controller_g4flex',
            action: 'work_order_create_validation_error',
            payload: req.query,
            response: { error: 'Invalid customer identifier format' },
            statusCode: 400,
            error: 'Invalid customer identifier format'
          });
          return res.status(400).json({ error: 'Invalid customer identifier format' });
        }

        if (identifierType === 'CPF') {
          const formatted = formatCPF(customerIdentifier);
          if (!formatted) {
            await logEvent({
              uraRequestId,
              source: 'controller_g4flex',
              action: 'work_order_create_validation_error',
              payload: req.query,
              response: { error: 'Invalid CPF' },
              statusCode: 400,
              error: 'Invalid CPF'
            });
            return res.status(400).json({ error: 'Invalid CPF' });
          }
          cpf = formatted;
        } else if (identifierType === 'CNPJ') {
          const formatted = formatCNPJ(customerIdentifier);
          if (!formatted) {
            await logEvent({
              uraRequestId,
              source: 'controller_g4flex',
              action: 'work_order_create_validation_error',
              payload: req.query,
              response: { error: 'Invalid CNPJ' },
              statusCode: 400,
              error: 'Invalid CNPJ'
            });
            return res.status(400).json({ error: 'Invalid CNPJ' });
          }
          cnpj = formatted;
        } else if (identifierType === 'CUSTOMER_ID') {
          const formatted = formatCustomerId(customerIdentifier);
          if (!formatted) {
            await logEvent({
              uraRequestId,
              source: 'controller_g4flex',
              action: 'work_order_create_validation_error',
              payload: req.query,
              response: { error: 'Invalid Customer ID' },
              statusCode: 400,
              error: 'Invalid Customer ID'
            });
            return res.status(400).json({ error: 'Invalid Customer ID' });
          }
          customerId = formatted;
        }
      }

      // Validate required fields
      const requiredFields = {
        productId,
        requesterName,
        requesterPosition,
        incidentDescription,
        siteContactPerson
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        await logEvent({
          uraRequestId,
          source: 'controller_g4flex',
          action: 'work_order_create_validation_error',
          payload: { ...req.body, ...req.query },
          response: { error: `Missing required fields: ${missingFields.join(', ')}` },
          statusCode: 400,
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
        return res.status(400).json({
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Return success response
      const response = {
        success: true,
        message: "Solicitação de criação de Ordem de Serviço realizada com sucessso."
      };

      await logEvent({
        uraRequestId,
        source: 'controller_g4flex',
        action: 'work_order_create_success',
        payload: {
          customerIdentifier,
          identifierType: determineIdentifierType(customerIdentifier),
          ...req.body
        },
        response,
        statusCode: 200,
        error: null
      });

      res.status(200).json(response);

      // Process the work order asynchronously
      WorkOrderService.createWorkOrder({
        cpf,
        cnpj,
        customerId,
        productId,
        requesterName,
        requesterPosition,
        incidentDescription,
        siteContactPerson,
        requesterWhatsApp,
        uraRequestId
      }).catch(error => {
        console.error('Error processing work order:', error);
        logEvent({
          uraRequestId,
          source: 'controller_g4flex',
          action: 'work_order_create_processing_error',
          payload: { customerIdentifier, ...req.body },
          response: { error: error.message },
          statusCode: 500,
          error: error.message
        }).catch(logError => {
          console.error('Error logging event:', logError);
        });
      });
    } catch (error) {

      await logEvent({
        uraRequestId,
        source: 'controller_g4flex',
        action: 'work_order_create_controller_error',
        payload: { ...req.query, ...req.body },
        response: { error: error.message },
        statusCode: 500,
        error: error.message
      });

      console.error('Error handling work order request:', error);
      return res.status(500).json({
        error: error.message || 'Error handling work order request'
      });
    }
  }
}

export default new WorkOrderController();
