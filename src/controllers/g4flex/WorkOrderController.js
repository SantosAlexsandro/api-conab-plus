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

  async closeWorkOrder(req, res) {
    try {
      const { cpf, cnpj, customerId } = req.query;

      const result = await WorkOrderService.closeWorkOrderByCustomerId({ cpf, cnpj, customerId });

      return res.json(result);
    } catch (error) {
      console.error('Error closing work order:', error);
      return res.status(500).json({
        error: error.message || 'Error closing work order'
      });
    }
  }

  /**
   * Create a new work order request
   * @param {Object} req - Request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.productId - Product identification code
   * @param {string} req.body.requesterName - Name of the person requesting
   * @param {string} req.body.requesterPosition - Position/role of the requester
   * @param {string} req.body.incidentDescription - Description of the reported problem
   * @param {string} req.body.siteContactPerson - Person responsible for the site
   * @param {Object} res - Response object
   * @returns {Promise<Object>} Request acknowledgment
   */
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
      WorkOrderService.createWorkOrder({
        productId,
        requesterName,
        requesterPosition,
        incidentDescription,
        siteContactPerson
      }).catch(error => {
        console.error('Error processing work order:', error);
      });
    } catch (error) {
      console.error('Error handling work order request:', error);
      return res.status(500).json({
        error: error.message || 'Error handling work order request'
      });
    }
  }
}

export default new WorkOrderController();
