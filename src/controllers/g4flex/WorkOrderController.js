import WorkOrderService from '../../services/g4flex/WorkOrderService';

class WorkOrderController {
  /**
   * Checks if the customer has immediate work orders
   * @param {Object} req - Request object
   * @param {Object} req.query - Query parameters
   * @param {string} [req.query.cpf] - Customer CPF (11 digits)
   * @param {string} [req.query.cnpj] - Customer CNPJ (14 digits)
   * @param {string} [req.query.codigoCliente] - Customer code in G4Flex
   * @param {Object} res - Response object
   * @returns {Promise<Object>} Response with work orders information
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

      const orders = await WorkOrderService.findOrdersByCustomer({
        cpf,
        cnpj,
        codigoCliente
      });

      const finishedStage = await Promise.all(orders.map(order =>
        WorkOrderService.findFinishedStageByOrder(order.Numero)
      ))

      const ordersWithFinishedStage = orders.filter((order, index) => finishedStage[index] !== null);

      console.log(`[WorkOrderController] Orders found: ${orders.length}`);
      console.log(`[WorkOrderController] Order numbers: ${orders.map(order => order.Numero).join(', ')}`);


      // TODO: Check if the customer has open orders
      // TODO: Check if the customer has finished orders

      return res.json({
        customerHasOpenOrders: orders && orders.length > 0,
        quantityOrders: orders ? orders.length : 0,
        orders: ordersWithFinishedStage.map(order => ({
          numero: order.Numero,
          dataCadastro: order.DataCadastro
        })) || []
      });
    } catch (error) {
      console.error('Error checking immediate orders:', error);
      return res.status(400).json({
        error: error.message || 'Error checking immediate orders'
      });
    }
  }
}

export default new WorkOrderController();
