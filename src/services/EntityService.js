// EntityService.js

import BaseERPService from './BaseERPService';
import moment from "moment";

class EntityService extends BaseERPService {
  constructor() {
    super();
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

  async savePartialData(data) {
    // Validação antes de enviar a requisição
    if (!data.Codigo) {
      throw new Error("O campo 'Codigo' é obrigatório.");
    }

    const url = "/api/Entidade/SavePartial?action=Update";

    try {
      const response = await this.axiosInstance.post(url, data);

      if (!response.data?.Codigo) {
        throw new Error("Falha ao obter o código da entidade atualizada.");
      }

      return response; // Retorna o resultado final
    } catch (error) {
      console.error("Erro ao salvar dados parciais:", error);

      // Relança o erro para ser tratado pelo controller
      throw new Error(
        error.response?.data?.message || "Erro ao salvar dados parciais."
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
      throw new Error(`${error.response.data?.Message || "Erro desconhecido"}`);
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

    data.CaracteristicaImovel = data.Entidade1Object?.CaracteristicaImovel;
    data.CodigoStatus = data.CodigoStatEnt;
    data.Logradouro = data.CodigoTipoLograd;

    // Reformatação de DataCadastro sem moment.js
    if (data.DataCadastro) {
      data.DataCadastro = new Date(data.DataCadastro).toLocaleDateString('pt-BR');
    }

    // Normalização de Categorias
    data.Categorias = data.Entidade1Object?.EntCategChildList?.map(categoria => ({
      Codigo: categoria.CodigoCategoria,
    })) ?? [];

    // Normalização de Telefones
    data.Telefones = data.Entidade1Object?.EntFoneChildList?.map(telefone => ({
      Sequencia: telefone.Sequencia,
      Tipo: telefone.Tipo,
      DDD: telefone.DDD,
      Numero: telefone.Numero,
      Principal: telefone.Principal,
      NumeroRamal: telefone.NumeroRamal,
      Descricao: telefone.Descricao,
    })) ?? [];

    // Normalização de E-mails
    data.Emails = data.Entidade1Object?.EntWebChildList?.map(email => ({
      Sequencia: email.Sequencia,
      Tipo: email.Tipo,
      Email: email.Email,
      Principal: email.Principal,
      NFe: email.NFe,
      NFSe: email.NFSe,
      Descricao: email.Descricao,
    })) ?? [];

    console.debug('Dados transformados:', data); // Melhor para debugging em ambiente de desenvolvimento

    return data;
  }

}

export default new EntityService();
