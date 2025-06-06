"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _https = require('https'); var _https2 = _interopRequireDefault(_https);

class WorkOrderService {
  constructor() {
    //this.apiUrl = process.env.REACT_APP_API_URL;
    //this.token = process.env.REACT_APP_API_TOKEN;
    this.apiUrl = process.env.ERP_API_URL;
    this.token = process.env.ERP_TOKEN;

    // Instância configurada do Axios
    this.axiosInstance = _axios2.default.create({
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
        status: _optionalChain([error, 'access', _ => _.response, 'optionalAccess', _2 => _2.status]) || 500,
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
        status: _optionalChain([error, 'access', _3 => _3.response, 'optionalAccess', _4 => _4.status]) || 500,
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

exports. default = new WorkOrderService();
