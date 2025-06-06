"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

class TechnicianERPService {
  constructor() {
    this.axiosInstance = _axios2.default.create({
      baseURL: process.env.ERP_API_URL,
      timeout: 20000,
      headers: {
        'Riosoft-Token': process.env.ERP_TOKEN,
        'Accept': 'application/json, text/plain, */*',
      },
    });
  }

  async getTechnicianFromOrder(orderNumber) {
    const { data } = await this.axiosInstance.get(`/api/OrdServ/Load?codigoEmpresaFilial=1&numero=${orderNumber}&loadChild=EtapaOrdServChildList`);
    const etapas = _nullishCoalesce(_optionalChain([data, 'optionalAccess', _ => _.EtapaOrdServChildList]), () => ( []));

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

exports. default = TechnicianERPService;
