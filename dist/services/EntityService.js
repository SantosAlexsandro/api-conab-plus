"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// EntityService.js

var _BaseERPService = require('./BaseERPService'); var _BaseERPService2 = _interopRequireDefault(_BaseERPService);
var _moment = require('moment'); var _moment2 = _interopRequireDefault(_moment);

class EntityService extends _BaseERPService2.default {
  constructor() {
    super();
  }

  // Método para atualizar dinamicamente o token
  setToken(token) {
    this.token = token;
    // Atualizar o header da instância singleton
    if (_BaseERPService2.default.axiosInstance) {
      _BaseERPService2.default.axiosInstance.defaults.headers["Riosoft-Token"] = token;
    }
  }

  // Método para criar uma nova entidade
  async create(data) {
    const url = "/api/Entidade/InserirAlterarEntidade";

    /*
    const sanitizeData = (data) => {
      return Object.keys(data).reduce((acc, key) => {
        acc[key] = data[key] === null ? "" : data[key];
        return acc;
      }, {});
    };
    const sanitizedData = sanitizeData(data);
    console.log('sanitizedData', sanitizedData)
  */

    try {
      const response = await this.axiosInstance.post(url, data);

      if (!_optionalChain([response, 'access', _ => _.data, 'optionalAccess', _2 => _2.Codigo])) {
        throw new Error("Falha ao obter o código da entidade criada.");
      }

      // Segunda requisição: Atualização do status.
      const resAfterEdit = await this.axiosInstance.post(url, {
        Codigo: _optionalChain([response, 'access', _3 => _3.data, 'optionalAccess', _4 => _4.Codigo]),
        CodigoStatus: "06",
      });

      return resAfterEdit; // Retorna o resultado final
    } catch (error) {
      this.handleError(error);
    }
  }

  // Método para criar uma nova entidade
  async update(data) {
    const url = "/api/Entidade/InserirAlterarEntidade";

    try {
      const response = await this.axiosInstance.post(url, data);

      if (!_optionalChain([response, 'access', _5 => _5.data, 'optionalAccess', _6 => _6.Codigo])) {
        throw new Error("Falha ao obter o código da entidade criada.");
      }

      return response; // Retorna o resultado final
    } catch (error) {
      this.handleError(error);
    }
  }

  async savePartialData(data) {
    // Validação antes de enviar a requisição
    if (!data.Codigo) {
      throw new Error("O campo 'Codigo' é obrigatório.");
    }

    const url = "/api/Entidade/SavePartial?action=Update";

    try {
      const response = await this.axiosInstance.post(url, data);

      if (!_optionalChain([response, 'access', _7 => _7.data, 'optionalAccess', _8 => _8.Codigo])) {
        throw new Error("Falha ao obter o código da entidade atualizada.");
      }

      return response; // Retorna o resultado final
    } catch (error) {
      console.error("Erro ao salvar dados parciais:", error);

      // Relança o erro para ser tratado pelo controller
      throw new Error(
        _optionalChain([error, 'access', _9 => _9.response, 'optionalAccess', _10 => _10.data, 'optionalAccess', _11 => _11.message]) || "Erro ao salvar dados parciais."
      );
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

  // Método para recuperar entidade por propriedade
  async getEntityByProperty(propertyField, propertyValue) {
    try {
      if (!propertyValue) {
        throw new Error(`Filter value for ${propertyField} not provided`);
      }

      const response = await this.axiosInstance.get(
        `/api/Entidade/RetrievePage?filter=${propertyField}=${propertyValue}&order=&pageSize=10&pageIndex=1`
      );

      if (!response.data || response.data.length === 0) {
        throw { status: 404, message: 'Customer not found' };
      }

      return {
        data: response.data,
        totalCount: response.headers["x-total-count"] || 10, // Fallback para 10 se o cabeçalho não existir
      };

    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Método para recuperar entidade pelo código de cadastro
  async loadEntityByCode(codeValue) {
    const url = `/api/Entidade/Load?Codigo=${codeValue}&loadChild=All&loadOneToOne=All`;
    try {
      const { data } = await this.axiosInstance.get(url);
      return data;
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
      throw new Error(`${_optionalChain([error, 'access', _12 => _12.response, 'access', _13 => _13.data, 'optionalAccess', _14 => _14.Message]) || "Erro desconhecido"}`);
    } else if (error.request) {
      console.error("Nenhuma resposta da API foi recebida:", error.request);
      throw new Error("Nenhuma resposta foi recebida da API.");
    } else {
      console.error("Erro ao configurar a requisição:", error.message);
      throw new Error(`Erro interno: ${error.message}`);
    }
  }

  transformEntityData(data) {
    // Garantindo consistência no tipo de pessoa jurídica ou física
    if (data.Tipo) {
      data.TipoFisicaJuridica = data.Tipo;
    }

    data.CaracteristicaImovel = _optionalChain([data, 'access', _15 => _15.Entidade1Object, 'optionalAccess', _16 => _16.CaracteristicaImovel]);
    data.CodigoStatus = data.CodigoStatEnt;
    data.Logradouro = data.CodigoTipoLograd;

    // Reformatação de DataCadastro sem moment.js
    if (data.DataCadastro) {
      data.DataCadastro = new Date(data.DataCadastro).toLocaleDateString('pt-BR');
    }

    // Normalização de Categorias
    data.Categorias = _nullishCoalesce(_optionalChain([data, 'access', _17 => _17.Entidade1Object, 'optionalAccess', _18 => _18.EntCategChildList, 'optionalAccess', _19 => _19.map, 'call', _20 => _20(categoria => ({
      Codigo: categoria.CodigoCategoria,
    }))]), () => ( []));

    // Normalização de Telefones
    data.Telefones = _nullishCoalesce(_optionalChain([data, 'access', _21 => _21.Entidade1Object, 'optionalAccess', _22 => _22.EntFoneChildList, 'optionalAccess', _23 => _23.map, 'call', _24 => _24(telefone => ({
      Sequencia: telefone.Sequencia,
      Tipo: telefone.Tipo,
      DDD: telefone.DDD,
      Numero: telefone.Numero,
      Principal: telefone.Principal,
      NumeroRamal: telefone.NumeroRamal,
      Descricao: telefone.Descricao,
    }))]), () => ( []));

    // Normalização de E-mails
    data.Emails = _nullishCoalesce(_optionalChain([data, 'access', _25 => _25.Entidade1Object, 'optionalAccess', _26 => _26.EntWebChildList, 'optionalAccess', _27 => _27.map, 'call', _28 => _28(email => ({
      Sequencia: email.Sequencia,
      Tipo: email.Tipo,
      Email: email.Email,
      Principal: email.Principal,
      NFe: email.NFe,
      NFSe: email.NFSe,
      Descricao: email.Descricao,
    }))]), () => ( []));

    console.debug('Dados transformados:', data); // Melhor para debugging em ambiente de desenvolvimento

    return data;
  }

}

exports. default = new EntityService();
