import contractService from '../../services/g4flex/ContractService';
import { formatCustomerId, formatCPF, formatCNPJ } from '../../utils/string/formatUtils';

class ContractController {
  /**
   * Check if customer has an active contract
   * @param {Object} req - Request object
   * @param {Object} req.query - Query parameters
   * @param {string} [req.query.cpf] - Customer CPF
   * @param {string} [req.query.cnpj] - Customer CNPJ
   * @param {string} [req.query.customerId] - Customer ID
   * @param {string} [req.query.uraRequestId] - URA request ID for logging
   * @param {Object} res - Response object
   * @returns {Promise<Object>} Contract status information
   */
  async checkContract(req, res) {
    try {
      let { cpf, cnpj, customerId, uraRequestId } = req.query;

      if (!customerId && !cpf && !cnpj) {
        return res.status(400).json({ error: 'Customer identification is required' });
      }
      if (!uraRequestId) {
        return res.status(400).json({ error: 'URA request ID is required' });
      }

      if (customerId && (cpf || cnpj)) {
        return res.status(400).json({ error: 'Customer ID, CPF, or CNPJ cannot be provided simultaneously' });
      }

      if (customerId) {
        console.log('customerId', customerId);
        customerId = formatCustomerId(customerId);
        console.log('formatted customerId', customerId);
      }
      if (cpf) {
        cpf = formatCPF(cpf);
        console.log('formatted cpf', cpf);
      }
      if (cnpj) {
        cnpj = formatCNPJ(cnpj);
        console.log('formatted cnpj', cnpj);
      }

      const contract = await contractService.checkActiveContract(cpf, cnpj, customerId, uraRequestId);
      return res.json(contract);
    } catch (error) {
      console.error('Error checking contract:', error);
      return res.status(500).json({ error: 'Error checking contract status' });
    }
  }
}

export default new ContractController();
