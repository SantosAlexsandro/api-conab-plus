import WorkOrderService from '../../services/g4flex/WorkOrderService';

class WorkOrderController {
  /**
   * Check customer's work orders status
   * @param {Object} req - Request object
   * @param {Object} req.query - Query parameters
   * @param {string} [req.query.cpf] - Customer CPF (11 digits)
   * @param {string} [req.query.cnpj] - Customer CNPJ (14 digits)
   * @param {string} [req.query.codigoCliente] - Customer code in G4Flex
   * @param {Object} res - Response object
   * @returns {Promise<Object>} Response with work orders status
   */
  async checkWorkOrder(req, res) {
    try {
      const { cpf, cnpj, codigoCliente } = req.query;

      // Validate input parameters
      if (!cpf && !cnpj && !codigoCliente) {
        return res.status(400).json({
          error: 'At least one of the following parameters is required: cpf, cnpj, or codigoCliente'
        });
      }

      if (cpf && !/^\d{11}$/.test(cpf)) {
        return res.status(400).json({
          error: 'Invalid CPF format. Must be 11 digits'
        });
      }

      if (cnpj && !/^\d{14}$/.test(cnpj)) {
        return res.status(400).json({
          error: 'Invalid CNPJ format. Must be 14 digits'
        });
      }

      const result = await WorkOrderService.checkWorkOrdersStatus({
        cpf,
        cnpj,
        codigoCliente
      });

      return res.json(result);
    } catch (error) {
      console.error('Error checking work orders:', error);
      return res.status(500).json({
        error: error.message || 'Error checking work orders'
      });
    }
  }
}

export default new WorkOrderController();
