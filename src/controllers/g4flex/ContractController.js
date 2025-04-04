import contractService from '../../services/g4flex/ContractService';
import logEvent from '../../utils/logEvent';

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
      const { cpf, cnpj, customerId, uraRequestId } = req.query;

      if (!customerId && !cpf && !cnpj) {
        return res.status(400).json({ error: 'Customer identification is required' });
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
