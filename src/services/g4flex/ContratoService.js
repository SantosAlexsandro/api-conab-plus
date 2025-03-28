import axios from 'axios';

class ContratoService {
  constructor() {
    this.apiUrl = "https://erpteste.conab.com.br:7211";
    this.token = "fwqSxis3uU79zWrAxDMAhvtLCMLlyrjQZ44veS2MoTSppX9k4xFJURiEt+UQwpEqFLV77fhb+35l0hVovHB/am51s0ieQvhGCh7FZ2IEnOpdQAHZlltOxVO19iawFO9r8s/3ynyM4BjsRhSq/gJF8mF1nszLuNMwuxKZ74T7eXlMLjpxjmkmX4SxdIa6PlMXgC/PwPRTisBm1Dz7/1KSVpmgokToGoVV/91pVS8DNAXTSI9eR91xccZkOqyVjzDUlO7sj9vRlz9owJ6JUULmt+utMcnDI/gM9PUyCPUSSFJn0sFLmTbenEQnLQJLNf53dxqE+NmuXlB9GDPbnkPeCAcsfBq2CXnqRvPfKy1zBR8HpTSD120NSS2R6ccQkT6kTya1DIzASi3D6/ZgE69cJyXNcwl1nJhhbbv1znxU22AnX4plGMi3kvbv7Ten+QsEKqNDvvqpYCtbsAdanIAMVkkGyQDscZ92TIIrpZ1KHSM=";

    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      timeout: 20000,
      headers: {
        "Riosoft-Token": this.token,
        Accept: "application/json, text/plain, */*",
      },
    });
  }

  async buscarCodigoCliente(documento) {
    try {
      const response = await this.axiosInstance.get(
        `/api/Entidade/RetrievePage?filter=CPFCNPJ=${documento}&order=&pageSize=10&pageIndex=1`
      );
      console.log('response', response.data);

      if (!response.data || response.data.length === 0) {
        throw new Error('Cliente não encontrado');
      }

      return response.data[0].Codigo;
    } catch (error) {
      throw new Error(`Erro ao buscar código do cliente: ${error.message}`);
    }
  }

  async verificarContratoAtivo(cpf, cnpj, codigoCliente) {
    try {
      let codigoClienteFinal = codigoCliente;

      // Se não tiver código do cliente, busca pelo CPF ou CNPJ
      if (!codigoClienteFinal) {
        const documento = cpf || cnpj;
        codigoClienteFinal = await this.buscarCodigoCliente(documento);
      }

      // Consulta contrato com o código do cliente
      const contratoResponse = await this.axiosInstance.get(
        `/api/Contrato/RetrievePage?filter=Status='Ativo' and ContratoPagRec='REC' and CodigoEntidade=${codigoClienteFinal}&order&pageSize=200&pageIndex=1`
      );

      return {
        codigoCliente: codigoClienteFinal,
        contratoAtivo: this.validarContratoAtivo(contratoResponse.data),
        //detalhesContrato: contratoResponse.data
      };
    } catch (error) {
      throw new Error(`Erro ao verificar contrato: ${error.message}`);
    }
  }

  validarContratoAtivo(contratoData) {
    // Verifica se existem contratos na resposta
    return contratoData && contratoData.length > 0;
  }

  handleError(error) {
    if (error.response) {
      console.error("Erro na resposta da API:", error.response.data);
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      console.error("Nenhuma resposta da API foi recebida:", error.request);
    } else {
      console.error("Erro ao configurar a requisição:", error.message);
    }
  }
}

export default new ContratoService();
