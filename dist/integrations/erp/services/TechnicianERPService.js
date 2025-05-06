"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

class TechnicianERPService {
  constructor() {
    this.axios = _axios2.default.create({
      baseURL: 'https://erpteste.conab.com.br:7211',
      headers: {
        'Riosoft-Token': 'fwqSxis3uU79zWrAxDMAhvtLCMLlyrjQZ44veS2MoTSppX9k4xFJURiEt+UQwpEqFLV77fhb+35l0hVovHB/am51s0ieQvhGCh7FZ2IEnOpdQAHZlltOxVO19iawFO9r8s/3ynyM4BjsRhSq/gJF8mF1nszLuNMwuxKZ74T7eXlMLjpxjmkmX4SxdIa6PlMXgC/PwPRTisBm1Dz7/1KSVpmgokToGoVV/91pVS8DNAXTSI9eR91xccZkOqyVjzDUlO7sj9vRlz9owJ6JUULmt+utMcnDI/gM9PUyCPUSSFJn0sFLmTbenEQnLQJLNf53dxqE+NmuXlB9GDPbnkPeCAcsfBq2CXnqRvPfKy1zBR8HpTSD120NSS2R6ccQkT6kTya1DIzASi3D6/ZgE69cJyXNcwl1nJhhbbv1znxU22AnX4plGMi3kvbv7Ten+QsEKqNDvvqpYCtbsAdanIAMVkkGyQDscZ92TIIrpZ1KHSM='
      }
    });
  }

  async getTechnicianFromOrder(orderNumber) {
    const { data } = await this.axios.get(`/api/OrdServ/Load?codigoEmpresaFilial=1&numero=${orderNumber}&loadChild=EtapaOrdServChildList`);
    const etapas = _nullishCoalesce(_optionalChain([data, 'optionalAccess', _ => _.EtapaOrdServChildList]), () => ( []));

    if (etapas.length === 0) return null;

    const ultimaEtapa = etapas.reduce((prev, curr) =>
      prev.Sequencia > curr.Sequencia ? prev : curr
    );

    console.log(`[TechnicianERPService] Técnico da ordem ${orderNumber}: ${ultimaEtapa.CodigoUsuario}`);
    return ultimaEtapa.CodigoUsuario;
  }

  async getActiveTechsFromEmployeeList() {
    const { data } = await this.axios.get('/api/Funcionario/RetrievePage?filter=Status=Trabalhando AND (CodigoCargo=04.26 OR CodigoCargo=04.27)&order&pageSize=200&pageIndex=1');
    return data;
  }
}

exports. default = TechnicianERPService;
