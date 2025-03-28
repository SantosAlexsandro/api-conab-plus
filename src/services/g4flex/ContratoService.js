import BaseG4FlexService from './BaseG4FlexService';

class ContratoService extends BaseG4FlexService {
  constructor() {
    super();
  }

  async verificarContratoAtivo(cpf, cnpj, codigoCliente) {
    try {
      let codigoClienteFinal = codigoCliente;

      if (!codigoClienteFinal) {
        const documento = cpf || cnpj;
        codigoClienteFinal = await this.buscarCodigoCliente(documento);
      }

      const contratoResponse = await this.axiosInstance.get(
        `/api/Contrato/RetrievePage?filter=Status='Ativo' and ContratoPagRec='REC' and CodigoEntidade=${codigoClienteFinal}&order&pageSize=200&pageIndex=1`
      );

      // TODO: Incluir Status de Suspenso faturamento

      return {
        codigoCliente: codigoClienteFinal,
        contratoAtivo: this.validarContratoAtivo(contratoResponse.data),
      };
    } catch (error) {
      this.handleError(error);
      throw new Error(`Erro ao verificar contrato: ${error.message}`);
    }
  }

  validarContratoAtivo(contratoData) {
    return contratoData && contratoData.length > 0;
  }
}

export default new ContratoService();
