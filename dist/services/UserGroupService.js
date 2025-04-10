"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _BaseERPService = require('./BaseERPService'); var _BaseERPService2 = _interopRequireDefault(_BaseERPService);

class UserGroupService extends _BaseERPService2.default {
    constructor() {
        super();
        this.endpoint = '/api/grpUsuario/Load';
    }

    async getUsersByGroup(groupCode) {
        try {
            const params = {
                codigo: groupCode,
                loadChild: 'All',
                loadOneToOne: 'All'
            };

            const response = await this.axiosInstance.get(this.endpoint, { params });

            if (!response.data || !response.data.GrpxUsuarioChildList) {
                return [];
            }

            return response.data.GrpxUsuarioChildList.map(user => ({
                codigoUsuario: user.CodigoUsuario
            }));
        } catch (error) {
            console.error('Erro ao buscar usuários por grupo:', error);
            throw error;
        }
    }
}

exports. default = new UserGroupService();
