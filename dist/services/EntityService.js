"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// EntityService.js

var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _moment = require('moment'); var _moment2 = _interopRequireDefault(_moment);

class EntityService {
  constructor(token) {
    this.apiUrl = "https://erpteste.conab.com.br:7211";

    this.axiosInstance = _axios2.default.create({
      baseURL: this.apiUrl,
      timeout: 20000, // Timeout de 20 segundos
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });

    // Armazena o token localmente no serviço
    this.token = token;

    // Configura o interceptor para adicionar o token antes de cada requisição
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers["Riosoft-Token"] = this.token; // Adiciona o token nos cabeçalhos
        }
        return config;
      },
      (error) => {
        return Promise.reject(error); // Lida com erros na configuração da requisição
      }
    );
  }

  // Método para atualizar dinamicamente o token
  setToken(token) {
    this.token = token;
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

  // Método para recuperar entidades paginadas
  async getAll(page = 1, filter = "") {
    const pageSize = 10;
    const order = "DataCadastro desc";
    const url = `/api/Entidade/RetrievePage?filter=${filter}&order=${order}&pageSize=${pageSize}&pageIndex=${page}`;

    try {
      const { data, headers } = await this.axiosInstance.get(url);
      return {
        data,
        totalCount: headers["x-total-count"] || 10, // Fallback para 10 se o cabeçalho não existir
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Método para recuperar entidade por ID
  async getById(Codigo) {
    const url = `/api/Entidade/Load?codigo=${Codigo}&loadChild=All&loadOneToOne=All`;
    try {
      const { data } = await this.axiosInstance.get(url);

      // Transforma os dados usando um método separado
      return this.transformEntityData(data);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Método para lidar com erros de forma padronizada
  handleError(error) {
    if (error.response) {
      console.error("Erro na resposta da API:", error.response.data);
      throw new Error(
        `Erro na API: ${error.response.status} - ${_optionalChain([error, 'access', _ => _.response, 'access', _2 => _2.data, 'optionalAccess', _3 => _3.message]) || "Erro desconhecido"}`
      );
    } else if (error.request) {
      console.error("Nenhuma resposta da API foi recebida:", error.request);
      throw new Error("Nenhuma resposta foi recebida da API.");
    } else {
      console.error("Erro ao configurar a requisição:", error.message);
      throw new Error(`Erro interno: ${error.message}`);
    }
  }

  // Método para transformar os dados da entidade
  transformEntityData(data) {
    // Sobrescreve a propriedade `Tipo` para garantir a consistência
    data.TipoFisicaJuridica = _nullishCoalesce(data.Tipo, () => ( data.TipoFisicaJuridica));
    delete data.Tipo; // Remove explicitamente `Tipo` se não for mais necessário

    data.CaracteristicaImovel = _optionalChain([data, 'access', _4 => _4.Entidade1Object, 'optionalAccess', _5 => _5.CaracteristicaImovel]);
    data.CodigoStatus = Number(data.CodigoStatEnt);
    data.DataCadastro = _moment2.default.call(void 0, data.DataCadastro).format("DD/MM/YYYY");

    let categorias = _optionalChain([data, 'access', _6 => _6.Entidade1Object, 'optionalAccess', _7 => _7.EntCategChildList, 'optionalAccess', _8 => _8.map, 'call', _9 => _9((categoria) => {
      return {
        Codigo: categoria.CodigoCategoria,
      };
    })]) || [];

    data.Categorias = categorias;

    return data;
  }
}

exports. default = new EntityService();
