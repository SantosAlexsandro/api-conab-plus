"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _WorkOrderService = require('../../services/g4flex/WorkOrderService'); var _WorkOrderService2 = _interopRequireDefault(_WorkOrderService);
var _uraValidator = require('../../utils/g4flex/validator/uraValidator');
var _formatUtils = require('../../utils/string/formatUtils');
var _logEvent = require('../../utils/logEvent'); var _logEvent2 = _interopRequireDefault(_logEvent);

class WorkOrderController {

  async checkWorkOrder(req, res) {
    console.log('req.query', req.query);
    const validationError = _uraValidator.validateURAQuery.call(void 0, req.query);

    let { customerIdentifier = '', uraRequestId = '' } = req.query;
    let cpf = null;
    let cnpj = null;
    let customerId = null;

    try {

      if (validationError) {
        await _logEvent2.default.call(void 0, {
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
        const identifierType = _uraValidator.determineIdentifierType.call(void 0, customerIdentifier);

        if (!identifierType) {
          await _logEvent2.default.call(void 0, {
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
          const formatted = _formatUtils.formatCPF.call(void 0, customerIdentifier);
          if (!formatted) {
            await _logEvent2.default.call(void 0, {
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
          const formatted = _formatUtils.formatCNPJ.call(void 0, customerIdentifier);
          if (!formatted) {
            await _logEvent2.default.call(void 0, {
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
          const formatted = _formatUtils.formatCustomerId.call(void 0, customerIdentifier);
          if (!formatted) {
            await _logEvent2.default.call(void 0, {
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

      const result = await _WorkOrderService2.default.checkWorkOrdersByCustomerId({
        cpf,
        cnpj,
        customerId,
        uraRequestId
      });

      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: 'controller_g4flex',
        action: 'work_order_check_success',
        payload: { customerIdentifier, identifierType: _uraValidator.determineIdentifierType.call(void 0, customerIdentifier) },
        response: result,
        statusCode: 200,
        error: null
      });

      return res.json(result);
    } catch (error) {

      await _logEvent2.default.call(void 0, {
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

      const validationError = _uraValidator.validateURAQuery.call(void 0, req.query);
      if (validationError) {
        await _logEvent2.default.call(void 0, {
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
        const identifierType = _uraValidator.determineIdentifierType.call(void 0, customerIdentifier);

        if (!identifierType) {
          await _logEvent2.default.call(void 0, {
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
          const formatted = _formatUtils.formatCPF.call(void 0, customerIdentifier);
          if (!formatted) {
            await _logEvent2.default.call(void 0, {
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
          const formatted = _formatUtils.formatCNPJ.call(void 0, customerIdentifier);
          if (!formatted) {
            await _logEvent2.default.call(void 0, {
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
          const formatted = _formatUtils.formatCustomerId.call(void 0, customerIdentifier);
          if (!formatted) {
            await _logEvent2.default.call(void 0, {
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

      const result = await _WorkOrderService2.default.closeWorkOrderByCustomerId({ cpf, cnpj, customerId });

      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: 'controller_g4flex',
        action: 'work_order_close_success',
        payload: { customerIdentifier, identifierType: _uraValidator.determineIdentifierType.call(void 0, customerIdentifier) },
        response: result,
        statusCode: 200,
        error: null
      });

      return res.json(result);
    } catch (error) {

      await _logEvent2.default.call(void 0, {
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

      const validationError = _uraValidator.validateURAQuery.call(void 0, req.query);
      if (validationError) {
        await _logEvent2.default.call(void 0, {
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
        const identifierType = _uraValidator.determineIdentifierType.call(void 0, customerIdentifier);

        if (!identifierType) {
          await _logEvent2.default.call(void 0, {
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
          const formatted = _formatUtils.formatCPF.call(void 0, customerIdentifier);
          if (!formatted) {
            await _logEvent2.default.call(void 0, {
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
          const formatted = _formatUtils.formatCNPJ.call(void 0, customerIdentifier);
          if (!formatted) {
            await _logEvent2.default.call(void 0, {
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
          const formatted = _formatUtils.formatCustomerId.call(void 0, customerIdentifier);
          if (!formatted) {
            await _logEvent2.default.call(void 0, {
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
        await _logEvent2.default.call(void 0, {
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

      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: 'controller_g4flex',
        action: 'work_order_create_success',
        payload: {
          customerIdentifier,
          identifierType: _uraValidator.determineIdentifierType.call(void 0, customerIdentifier),
          ...req.body
        },
        response,
        statusCode: 200,
        error: null
      });

      res.status(200).json(response);

      // Process the work order asynchronously
      _WorkOrderService2.default.createWorkOrder({
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
        _logEvent2.default.call(void 0, {
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

      await _logEvent2.default.call(void 0, {
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

exports. default = new WorkOrderController();
