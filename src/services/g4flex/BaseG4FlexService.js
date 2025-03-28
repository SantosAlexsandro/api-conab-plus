import axios from 'axios';

class BaseG4FlexService {
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

  /**
   * Busca o código do cliente usando CPF ou CNPJ
   * @param {string} documento - CPF ou CNPJ do cliente
   * @returns {Promise<string>} Código do cliente
   */
  async buscarCodigoCliente(documento) {
    try {
      if (!documento) {
        throw new Error('Documento (CPF/CNPJ) não fornecido');
      }

      const response = await this.axiosInstance.get(
        `/api/Entidade/RetrievePage?filter=CPFCNPJ=${documento}&order=&pageSize=10&pageIndex=1`
      );

      if (!response.data || response.data.length === 0) {
        throw new Error('Cliente não encontrado');
      }

      return response.data[0].Codigo;
    } catch (error) {
      this.handleError(error);
      throw new Error(`Erro ao buscar código do cliente: ${error.message}`);
    }
  }

  /**
   * Trata erros da API
   * @param {Error} error - Erro ocorrido
   */
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

export default BaseG4FlexService;
