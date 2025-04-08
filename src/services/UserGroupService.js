import BaseERPService from './BaseERPService';

class UserGroupService extends BaseERPService {
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

export default new UserGroupService();
