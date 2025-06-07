import BaseERPService from './BaseERPService';

class TechnicianERPService extends BaseERPService {
  constructor() {
    super();
  }

  async getTechnicianFromOrder(orderNumber) {
    const { data } = await this.axiosInstance.get(`/api/OrdServ/Load?codigoEmpresaFilial=1&numero=${orderNumber}&loadChild=EtapaOrdServChildList`);
    const etapas = data?.EtapaOrdServChildList ?? [];

    if (etapas.length === 0) return null;

    const ultimaEtapa = etapas.reduce((prev, curr) =>
      prev.Sequencia > curr.Sequencia ? prev : curr
    );

    console.log(`[TechnicianERPService] Técnico da ordem ${orderNumber}: ${ultimaEtapa.CodigoUsuario}`);
    return ultimaEtapa.CodigoUsuario;
  }

  async getActiveTechsFromEmployeeList() {
    const { data } = await this.axiosInstance.get("/api/Funcionario/RetrievePage?filter=Status='Trabalhando' AND (CodigoCargo='04.26' OR CodigoCargo='04.27')&order&pageSize=200&pageIndex=1");
    return data;
  }
}

export default TechnicianERPService;
