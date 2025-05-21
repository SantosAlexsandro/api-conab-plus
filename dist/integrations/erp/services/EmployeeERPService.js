"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _BaseERPService = require('./BaseERPService'); var _BaseERPService2 = _interopRequireDefault(_BaseERPService);

class EmployeeERPService extends _BaseERPService2.default {
  constructor() {
    super();
  }

  async getEmployeeByUserCode(userCode) {
    console.log('INIT getEmployeeByUserCode', userCode);
    try {
      const { data } = await this.axiosInstance.get(`/api/Funcionario/RetrievePage?filter=CodigoUsuario='${userCode}'&order&pageSize=10&pageIndex=1`);

      return data;
    } catch (error) {
      console.error('Erro ao buscar funcionário:', error);
      throw error;
    }
  }
}

exports. default = EmployeeERPService;
