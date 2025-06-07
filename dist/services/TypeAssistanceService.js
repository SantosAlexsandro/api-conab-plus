"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _https = require('https'); var _https2 = _interopRequireDefault(_https);

class TypeAssistanceService {
  constructor() {
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
        _optionalChain([error, 'access', _ => _.response, 'access', _2 => _2.data, 'optionalAccess', _3 => _3.message]) || "Sem mensagem"
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

exports. default = new TypeAssistanceService();
