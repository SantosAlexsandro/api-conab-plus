import contractService from '../../services/g4flex/ContractService';
import { formatCustomerId, formatCPF, formatCNPJ } from '../../utils/string/formatUtils';
import { validateURAQuery } from '../../utils/g4flex/validator/uraValidator';
import  logEvent  from '../../utils/logEvent';

class ContractController {
  async checkContract(req, res) {
    try {
      const validationError = validateURAQuery(req.query);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      let { cpf, cnpj, customerId, uraRequestId } = req.query;

      await logEvent({
        uraRequestId,
        source: 'controller_4gflex',
        action: 'contract_check_received',
        payload: { cpf, cnpj, customerId }
      });

      if (customerId) {
        const formatted = formatCustomerId(customerId);
        if (!formatted) {
          return res.status(400).json({ error: 'Invalid Customer ID' });
        }
        customerId = formatted;
      }

      if (cpf) {
        const formatted = formatCPF(cpf);
        if (!formatted) {
          return res.status(400).json({ error: 'Invalid CPF' });
        }
        cpf = formatted;
      }

      if (cnpj) {
        const formatted = formatCNPJ(cnpj);
        if (!formatted) {
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

      return res.json(contract);
    } catch (error) {
      await logEvent({
        uraRequestId,
        source: 'controller_4gflex',
        action: 'contract_check_error',
        payload: { cpf, cnpj, customerId }
      });
      return res.status(500).json({ error: 'Error checking contract status' });
    }
  }
}

export default new ContractController();
