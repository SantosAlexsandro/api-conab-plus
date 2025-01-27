// EntityService

import axios from "axios";
import https from "https";
import moment from "moment";
import TokenService from "./TokenService";

class EntityService {
  constructor() {
    this.apiUrl = "https://erpteste.conab.com.br:7211";

    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      timeout: 20000, // Timeout de 20 segundos
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });

    // Configura o interceptor para adicionar o token antes de cada requisição
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = TokenService.getToken(); // Obtém o token de sessão global
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
      data.TipoFisicaJuridica = data.Tipo ?? data.TipoFisicaJuridica;
      delete data.Tipo; // Remove explicitamente `Tipo` se não for mais necessárioos

      data.CaracteristicaImovel = data.Entidade1Object?.CaracteristicaImovel;
      data.CodigoStatus = Number(data.CodigoStatEnt);
      data.DataCadastro = moment(data.DataCadastro).format("DD/MM/YYYY");

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

export default new EntityService();
