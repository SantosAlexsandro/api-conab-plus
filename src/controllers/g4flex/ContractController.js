// src/controllers/g4flex/ContractController.js
import contractService from '../../services/g4flex/ContractService';
import { formatCustomerId, formatCPF, formatCNPJ } from '../../utils/string/formatUtils';
import { validateURAQuery } from '../../utils/g4flex/validator/uraValidator';
import logEvent from '../../utils/logEvent';

class ContractController {
  async checkContract(req, res) {
    let { cpf, cnpj, customerId, uraRequestId } = req.query;

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
          action: 'contract_check_validation_error',
          payload: req.query,
          response: { error: validationError },
          statusCode: 400,
          error: validationError
        });
        return res.status(400).json({ error: validationError });
      }

      if (customerId) {
        const formatted = formatCustomerId(customerId);
        if (!formatted) {
          await logEvent({
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
        const formatted = formatCPF(cpf);
        if (!formatted) {
          await logEvent({
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
        const formatted = formatCNPJ(cnpj);
        if (!formatted) {
          await logEvent({
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

      const contract = await contractService.checkActiveContract(
        cpf,
        cnpj,
        customerId,
        uraRequestId
      );

      await logEvent({
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

      await logEvent({
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

export default new ContractController();
