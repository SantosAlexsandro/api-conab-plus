"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/controllers/g4flex/ContractController.js
var _ContractService = require('../../services/g4flex/ContractService'); var _ContractService2 = _interopRequireDefault(_ContractService);
var _formatUtils = require('../../utils/string/formatUtils');
var _uraValidator = require('../../utils/g4flex/validator/uraValidator');
var _logEvent = require('../../utils/logEvent'); var _logEvent2 = _interopRequireDefault(_logEvent);

class ContractController {
  async checkContract(req, res) {
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
          action: 'contract_check_validation_error',
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
            action: 'contract_check_validation_error',
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
            action: 'contract_check_validation_error',
            payload: req.query,
            response: { error: 'Invalid CNPJ' },
            statusCode: 400,
            error: 'Invalid CNPJ'
          });
          return res.status(400).json({ error: 'Invalid CNPJ' });
        }
        cnpj = formatted;
      }

      const contract = await _ContractService2.default.checkActiveContract(
        cpf,
        cnpj,
        customerId,
        uraRequestId
      );

      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: 'controller_g4flex',
        action: 'contract_check_success',
        payload: { cpf, cnpj, customerId },
        response: contract,
        statusCode: 200,
        error: null
      });

      return res.json(contract);
    } catch (error) {
      const statusCode = error.status || 500;
      const errorMessage = error.message || 'Error checking contract status';

      await _logEvent2.default.call(void 0, {
        uraRequestId,
        source: 'controller_g4flex',
        action: 'contract_check_controller_error',
        payload: req.query,
        response: { error: errorMessage },
        statusCode,
        error: errorMessage
      });

      return res.status(statusCode).json({ error: errorMessage });
    }
  }
}

exports. default = new ContractController();
