import BaseG4FlexService from './BaseG4FlexService';

class WorkOrderService extends BaseG4FlexService {
  constructor() {
    super();
  }

  /**
   * Busca ordens de serviço por cliente
   * @param {Object} params - Parâmetros de busca
   * @param {string} [params.cpf] - CPF do cliente
   * @param {string} [params.cnpj] - CNPJ do cliente
   * @param {string} [params.codigoCliente] - Código do cliente
   * @returns {Promise<Array>} Lista de ordens de serviço
   */
  async buscarOrdensPorCliente({ cpf, cnpj, codigoCliente }) {
    try {
      let codigoClienteFinal = codigoCliente;

      if (!codigoClienteFinal) {
        const documento = cpf || cnpj;
        if (!documento) {
          throw new Error('CPF ou CNPJ não fornecido');
        }
        codigoClienteFinal = await this.buscarCodigoCliente(documento);
      }

      const dataInicio = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(); // Menos 1 dia
      const dataFim = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(); // Mais 1 dia

      const response = await this.axiosInstance.get(
        `/api/OrdServ/RetrievePage?filter=ISNULL(DataEncerramento) AND CodigoEntidade=${codigoClienteFinal} AND (DataCadastro >= %23${dataInicio}%23 AND DataCadastro < %23${dataFim}%23)&order=&pageSize=10&pageIndex=1`
      );

      console.log(`[G4Flex] Buscando ordens de serviço para o cliente ${codigoClienteFinal}. Endpoint: /api/OrdServ/RetrievePage?filter=ISNULL(DataEncerramento) AND CodigoEntidade=${codigoClienteFinal} AND (DataCadastro >= %23${dataInicio}%23 AND DataCadastro < %23${dataFim}%23)&order=&pageSize=10&pageIndex=1`);

      return response.data;
    } catch (error) {
      this.handleError(error);
      throw new Error(`Erro ao buscar ordens de serviço: ${error.message}`);
    }
  }
}

export default new WorkOrderService();
