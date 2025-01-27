"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// EntityService

var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _https = require('https'); var _https2 = _interopRequireDefault(_https);
var _moment = require('moment'); var _moment2 = _interopRequireDefault(_moment);
var _TokenService = require('./TokenService'); var _TokenService2 = _interopRequireDefault(_TokenService);

class EntityService {
  constructor() {
    this.apiUrl = "https://erpteste.conab.com.br:7211";

    this.axiosInstance = _axios2.default.create({
      baseURL: this.apiUrl,
      timeout: 20000, // Timeout de 20 segundos
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });

    // Configura o interceptor para adicionar o token antes de cada requisição
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = _TokenService2.default.getToken(); // Obtém o token de sessão global
        if (token) {
          config.headers["Riosoft-Token"] = token; // Adiciona o token nos cabeçalhos
        }
        return config;
      },
      (error) => {
        return Promise.reject(error); // Lida com erros na configuração da requisição
      }
    );
  }

  // Método para criar uma nova entidade
  async create(data) {
    const url = "/api/Entidade/InserirAlterarEntidade";
    try {
      const response = await this.axiosInstance.post(url, data);
      return response;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAll(page = 1, filter = "") {
    filter = "";
    const pageSize = 10;
    const order = "DataCadastro desc";
    const url = `/api/Entidade/RetrievePage?filter=${filter}&order=${order}&pageSize=${pageSize}&pageIndex=1`;
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

  async getById(Codigo) {
    // const url = `/api/Entidade/Load?codigo=${Codigo}`;
    const url = `/api/Entidade/Load?codigo=${Codigo}&loadChild=All&loadOneToOne=All`;
    try {
      const { data, headers } = await this.axiosInstance.get(url);

      // Sobrescreve a propriedade `Tipo` para garantir a consistência
      data.TipoFisicaJuridica = _nullishCoalesce(data.Tipo, () => ( data.TipoFisicaJuridica));
      delete data.Tipo; // Remove explicitamente `Tipo` se não for mais necessárioos

      data.CaracteristicaImovel = _optionalChain([data, 'access', _ => _.Entidade1Object, 'optionalAccess', _2 => _2.CaracteristicaImovel]);
      data.CodigoStatus = Number(data.CodigoStatEnt);
      data.DataCadastro = _moment2.default.call(void 0, data.DataCadastro).format("DD/MM/YYYY");

      // console.log(data.Entidade1Object.EntCategChildList)

      let categorias = data.Entidade1Object.EntCategChildList.map(
        (categoria) => {
          return {
            Codigo: categoria.CodigoCategoria,
          };
        }
      );
      //console.log("categorias", categorias)

      data.Categorias = categorias;

      return data;
    } catch (error) {
      this.handleError(error);
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

exports. default = new EntityService();
