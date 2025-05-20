import BaseERPService from './BaseERPService';

class EmployeeERPService extends BaseERPService {
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

export default EmployeeERPService;
