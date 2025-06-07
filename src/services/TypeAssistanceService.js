import axios from "axios";
import https from "https";

class TypeAssistanceService {
  constructor() {
    this.apiUrl = process.env.ERP_API_URL;
    this.token = process.env.ERP_TOKEN;

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
