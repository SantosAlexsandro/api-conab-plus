import WorkOrderService from '../../services/g4flex/WorkOrderService';

class WorkOrderController {
  /**
   * Verifica se o cliente tem ordens de serviço imediata
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async verificarOrdem(req, res) {
    try {
      const { cpf, cnpj, codigoCliente } = req.query;

      const ordens = await WorkOrderService.buscarOrdensPorCliente({
        cpf,
        cnpj,
        codigoCliente
      });

      console.log(`[WorkOrderController] Ordens encontradas: ${ordens.length}`);
      console.log(`[WorkOrderController] Números das ordens: ${ordens.map(ordem => ordem.Numero).join(', ')}`);

      return res.json({
        customerHasOrders: ordens && ordens.length > 0,
        quantityOrders: ordens ? ordens.length : 0,
        orders: ordens.map(ordem => ({
          numero: ordem.Numero,
          dataCadastro: ordem.DataCadastro
        })) || []
      });
    } catch (error) {
      console.error('Erro ao verificar ordens imediatas:', error);
      return res.status(400).json({
        error: error.message || 'Erro ao verificar ordens imediatas'
      });
    }
  }
}

export default new WorkOrderController();
