"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _BaseERPService = require('./BaseERPService'); var _BaseERPService2 = _interopRequireDefault(_BaseERPService);

class CategoryService extends _BaseERPService2.default {
  constructor() {
    super();
    // CategoryService usa um endpoint específico, então sobrescreve a baseURL
    this.categoryAxiosInstance = this.axiosInstance.create ?
      this.axiosInstance.create({ baseURL: `${this.apiUrl}/api/Categoria` }) :
      this.axiosInstance;
  }

  // Método para buscar todas as categorias
  async getAll(page = 1, filter = '') {
    const pageSize = 50;
    const url = `/api/Categoria/RetrievePage?filter=${filter}&order&pageSize=${pageSize}&pageIndex=1`;

    try {
      const { data, headers } = await this.axiosInstance.get(url);
      return {
        data,
        totalCount: headers['x-total-count'] || 10, // Fallback para 10 se o cabeçalho não existir
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Método para buscar uma categoria específica por ID
  async getById(id) {
    try {
      const { data } = await this.axiosInstance.get(`/api/Categoria/${id}`);
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }
}

exports. default = new CategoryService();
