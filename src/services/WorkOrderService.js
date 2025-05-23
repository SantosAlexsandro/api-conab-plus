import axios from "axios";
import https from "https";

class WorkOrderService {
  constructor() {
    //this.apiUrl = process.env.REACT_APP_API_URL;
    //this.token = process.env.REACT_APP_API_TOKEN;
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

  // Método para criar uma nova entidade
  async create(data) {
    const url = "/api/OrdServ/InserirAlterarOrdServ";
    try {
      const response = await this.axiosInstance.post(url, data);
      return response;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAll(page = 1, filter = "") {
    filter =
      "DataCadastro >= %232024-10-29T03:00:00.000Z%23 AND DataCadastro < %232024-11-30T03:00:00.000Z%23";
    const pageSize = 10;
    const order = "Codigo desc";
    const url = `/api/OrdServ/RetrievePage?filter=${filter}&order&pageSize=${pageSize}&pageIndex=1`;
    try {
      // console.log("url", url);
      const { data, headers } = await this.axiosInstance.get(url);
      return {
        data,
        totalCount: headers["x-total-count"] || 10, // Fallback para 10 se o cabeçalho não existir
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAllbyTech() {
    try {
      const url = `/api/OrdServ/Lista?codigoUsuario=LEONARDO.LIMA&codigoEmpresa=1&dataAtualizacao=01/04/2025`;

      const response = await this.axiosInstance.get(url);

      // 🟢 **Corrige o problema de `multipart/form-data`**
      // Usa Regex para encontrar o JSON dentro da resposta
      const match = response.data.match(/\[.*\]/s);

      if (match) {
        const jsonData = JSON.parse(match[0]); // Converte para JSON real
        console.log("Dados convertidos:", 'END');
        return jsonData;
      } else {
        console.error("Nenhum JSON válido encontrado na resposta.");
        throw new Error("Nenhum JSON válido encontrado na resposta da API.");
      }
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  async updateOrderStage(data) {
    const url = "/api/OrdServ/Inserir";
    try {
      const response = await this.axiosInstance.post(url, data);
      // Retorna apenas os dados necessários da resposta
      return {
        status: response.status,
        data: response.data,
        success: true
      };
    } catch (error) {
      this.handleError(error);
      return {
        status: error.response?.status || 500,
        message: error.message,
        success: false
      };
    }
  }

  async getNextStages() {
    const url = "/api/TipoEtapa/ListaNew?dataAtualizacao=01/01/1970";
    try {
      const response = await this.axiosInstance.get(url);
      return response.data;
    } catch (error) {
      this.handleError(error);
      return {
        status: error.response?.status || 500,
        message: error.message,
        success: false
      };
    }
  }

  // Método para lidar com erros de forma padronizada
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

export default new WorkOrderService();
