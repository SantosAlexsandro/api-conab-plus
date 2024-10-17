import axios from "axios";
import https from "https";

class TypeAssistanceService {
  constructor() {
    this.apiUrl = "https://erpteste.conab.com.br:7211";
    this.token =
      "fwqSxis3uU79zWrAxDMAhvtLCMLlyrjQZ44veS2MoTSppX9k4xFJURiEt+UQwpEqFLV77fhb+35l0hVovHB/am51s0ieQvhGCh7FZ2IEnOpdQAHZlltOxVO19iawFO9r8s/3ynyM4BjsRhSq/gJF8mF1nszLuNMwuxKZ74T7eXlMLjpxjmkmX4SxdIa6PlMXgC/PwPRTisBm1Dz7/1KSVpmgokToGoVV/91pVS8DNAXTSI9eR91xccZkOqyVjzDUlO7sj9vRlz9owJ6JUULmt+utMcnDI/gM9PUyCPUSSFJn0sFLmTbenEQnLQJLNf53dxqE+NmuXlB9GDPbnkPeCAcsfBq2CXnqRvPfKy1zBR8HpTSD120NSS2R6ccQkT6kTya1DIzASi3D6/ZgE69cJyXNcwl1nJhhbbv1znxU22AnX4plGMi3kvbv7Ten+QsEKqNDvvqpYCtbsAdanIAMVkkGyQDscZ92TIIrpZ1KHSM=";

    // Instância configurada do Axios
    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      timeout: 20000, // 10 segundos de timeout
      headers: {
        "Riosoft-Token": this.token,
        Accept: "application/json, text/plain, */*",
      },
    });
  }

  // Método para buscar todas as regiões
  async getAll() {
    const payload = {
      FormName: "TipoAtendContrato",
      ClassInput: "TipoAtendContrato",
      ControllerForm: "ordServ",
      TypeObject: "objetoTela",
      Filter: "",
      Input: "CodigoTipoAtendContrato",
      Type: "GridTable",
      Order: "Codigo",
      OrderUser: "",
      PageSize: 10,
      PageIndex: 1,
      ClassVinculo: "ordServ",
      DisabledCache: false,
      Shortcut: "ordserv",
      BindingName: "",
      IsGroupBy: false,
    };

    const url = "/api/ordServ/GetListForComponents";
    try {
      const response = await this.axiosInstance.post(url, payload);
      return response;
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // Log apenas as informações essenciais da resposta
      console.error(
        "Erro na resposta da API:",
        error.response.data?.message || "Sem mensagem"
      );
      console.error("Status:", error.response.status);
    } else if (error.request) {
      // Logar apenas informações relevantes da requisição
      console.error(
        "Nenhuma resposta da API foi recebida. Detalhes:",
        error.request._header || "Sem detalhes do cabeçalho"
      );
    } else {
      // Mensagem de erro padrão
      console.error("Erro ao configurar a requisição:", error.message);
    }

    throw new Error("Erro ao processar a requisição.");
  }
}

export default new TypeAssistanceService();
