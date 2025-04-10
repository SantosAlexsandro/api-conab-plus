"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _WorkOrderService = require('../../services/g4flex/WorkOrderService'); var _WorkOrderService2 = _interopRequireDefault(_WorkOrderService);
var _uraValidator = require('../../utils/g4flex/validator/uraValidator');
var _formatUtils = require('../../utils/string/formatUtils');
var _logEvent = require('../../utils/logEvent'); var _logEvent2 = _interopRequireDefault(_logEvent);

class WorkOrderController {

  async checkWorkOrder(req, res) {
    let { cpf, cnpj, customerId, uraRequestId } = req.query;

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
          action: 'work_order_check_validation_error',
          payload: req.query,
          response: { error: validationError },
          statusCode: 400,
          error: validationError
        });
        return res.status(400).json({ error: validationError });
      }

      if (customerId) {
        const formatted = _formatUtils.formatCustomerId.call(void 0, customerId);
        if (!formatted) {
          await _logEvent2.default.call(void 0, {
            uraRequestId,
            source: 'controller_g4flex',
            action: 'contract_check_validation_error',
            payload: req.query,
            response: { error: 'Invalid Customer ID' },
            statusCode: 400,
            error: 'Invalid Customer ID'
          });
          return res.status(400).json({ error: 'Invalid Customer ID' });
        }
        customerId = formatted;
      }

      if (cpf) {
        const formatted = _formatUtils.formatCPF.call(void 0, cpf);
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
      }

      if (cnpj) {
        const formatted = _formatUtils.formatCNPJ.call(void 0, cnpj);
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
        payload: { cpf, cnpj, customerId },
        response: result,
        statusCode: 200,
        error: null
      });

      return res.json(result);
    } catch (error) {

      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: 'controller_g4flex',
        action: 'contract_check_controller_error',
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
    let { cpf, cnpj, customerId, uraRequestId } = req.query;

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
          action: 'work_order_close_check_validation_error',
          payload: req.query,
          response: { error: validationError },
          statusCode: 400,
          error: validationError
        });
        return res.status(400).json({ error: validationError });
      }

      if (customerId) {
        const formatted = _formatUtils.formatCustomerId.call(void 0, customerId);
        if (!formatted) {
          await _logEvent2.default.call(void 0, {
            uraRequestId,
            source: 'controller_g4flex',
            action: 'contract_check_validation_error',
            payload: req.query,
            response: { error: 'Invalid Customer ID' },
            statusCode: 400,
            error: 'Invalid Customer ID'
          });
          return res.status(400).json({ error: 'Invalid Customer ID' });
        }
        customerId = formatted;
      }

      if (cpf) {
        const formatted = _formatUtils.formatCPF.call(void 0, cpf);
        if (!formatted) {
          await _logEvent2.default.call(void 0, {
            uraRequestId,
            source: 'controller_g4flex',
            action: 'work_order_close_check_validation_error',
            payload: req.query,
            response: { error: 'Invalid CPF' },
            statusCode: 400,
            error: 'Invalid CPF'
          });
          return res.status(400).json({ error: 'Invalid CPF' });
        }
        cpf = formatted;
      }

      if (cnpj) {
        const formatted = _formatUtils.formatCNPJ.call(void 0, cnpj);
        if (!formatted) {
          await _logEvent2.default.call(void 0, {
            uraRequestId,
            source: 'controller_g4flex',
            action: 'work_order_close_check_validation_error',
            payload: req.query,
            response: { error: 'Invalid CNPJ' },
            statusCode: 400,
            error: 'Invalid CNPJ'
          });
          return res.status(400).json({ error: 'Invalid CNPJ' });
        }
        cnpj = formatted;
      }
      const result = await _WorkOrderService2.default.closeWorkOrderByCustomerId({ cpf, cnpj, customerId });

      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: 'controller_g4flex',
        action: 'work_order_close_success',
        payload: { cpf, cnpj, customerId },
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
    try {
      const {
        productId,
        requesterName,
        requesterPosition,
        incidentDescription,
        siteContactPerson
      } = req.body;

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
        return res.status(400).json({
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Return immediate acknowledgment
      res.status(202).json({
        message: 'Work order request received successfully',
        requestData: {
          productId,
          requesterName,
          requesterPosition,
          incidentDescription,
          siteContactPerson
        }
      });

      // Process the work order asynchronously
      _WorkOrderService2.default.createWorkOrder({
        productId,
        requesterName,
        requesterPosition,
        incidentDescription,
        siteContactPerson
      }).catch(error => {
        console.error('Error processing work order:', error);
      });
    } catch (error) {

      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: 'controller_g4flex',
        action: 'work_order_create_controller_error',
        payload: req.body,
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
