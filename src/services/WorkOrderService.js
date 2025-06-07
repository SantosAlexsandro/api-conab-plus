import BaseERPService from './BaseERPService';

class WorkOrderService extends BaseERPService {
  constructor() {
    super();
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
