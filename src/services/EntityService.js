// EntityService.js

import axios from "axios";
import moment from "moment";

class EntityService {
  constructor(token) {
    this.apiUrl = "https://erpteste.conab.com.br:7211";

    this.axiosInstance = axios.create({
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

      if (!response.data?.Codigo) {
        throw new Error("Falha ao obter o código da entidade criada.");
      }

      // Segunda requisição: Atualização do status.
      const resAfterEdit = await this.axiosInstance.post(url, {
        Codigo: response.data?.Codigo,
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

      if (!response.data?.Codigo) {
        throw new Error("Falha ao obter o código da entidade criada.");
      }

      return response; // Retorna o resultado final
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
        `${
          error.response.data?.Message || "Erro desconhecido"
        }`
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
    data.TipoFisicaJuridica = data.Tipo ?? data.TipoFisicaJuridica;
    delete data.Tipo; // Remove explicitamente `Tipo` se não for mais necessário

    data.CaracteristicaImovel = data.Entidade1Object?.CaracteristicaImovel;
    data.CodigoStatus = data.CodigoStatEnt;
    data.DataCadastro = moment(data.DataCadastro).format("DD/MM/YYYY");

    // Normalização categorias
    let categorias =
      data.Entidade1Object?.EntCategChildList?.map((categoria) => {
        return {
          Codigo: categoria.CodigoCategoria,
        };


      }) || [];

    data.Categorias = categorias;

    // Normalização telefones
    let telefones =
      data.Entidade1Object?.EntFoneChildList?.map((telefone) => {
        return {
          Sequencia: telefone.Sequencia,
          Tipo: telefone.Tipo,
          DDD: telefone.DDD,
          Numero: telefone.Numero,
          Principal: telefone.Principal,
          NumeroRamal: telefone.NumeroRamal,
          Descricao: telefone.Descricao,
        };
      }) || [];

    data.Telefones = telefones;

    // Normalização e-mails
    let emails =
    data.Entidade1Object?.EntWebChildList?.map((email) => {
      return {
        Sequencia: email.Sequencia,
        Tipo: email.Tipo,
        Email: email.Email,
        Principal: email.Principal,
        NFe: email.NFe,
        NFSe: email.NFSe,
        Descricao: email.Descricao
      };
    }) || [];

  data.Emails = emails;

    return data;
  }
}

export default new EntityService();
