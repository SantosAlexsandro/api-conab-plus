// src/integrations/g4flex/controllers/ContractController.js
import contractService from '../services/ContractService';
import { formatCustomerId, formatCPF, formatCNPJ } from '../../../utils/string/formatUtils';
import { validateURAQuery, determineIdentifierType } from '../utils/uraValidator';
import logEvent from '../../../utils/logEvent';

class ContractController {
  async checkContract(req, res) {
    let { customerIdentifier = '', uraRequestId = '' } = req.query;
    let cpf = null;
    let cnpj = null;
    let customerId = null;

    try {
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

      // Determina o tipo de identificador e formata adequadamente
      if (customerIdentifier) {
        const identifierType = determineIdentifierType(customerIdentifier);

        if (!identifierType) {
          await logEvent({
            uraRequestId,
            source: 'controller_g4flex',
            action: 'contract_check_validation_error',
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
              action: 'contract_check_validation_error',
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
              action: 'contract_check_validation_error',
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
        payload: { customerIdentifier, identifierType: determineIdentifierType(customerIdentifier) },
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
