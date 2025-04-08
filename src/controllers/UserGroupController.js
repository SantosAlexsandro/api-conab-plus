import UserGroupService from '../services/UserGroupService';

class UserGroupController {
    async getUsersByGroup(req, res) {
        try {
            const { groupCode } = req.params;

            if (!groupCode) {
                return res.status(400).json({
                    error: 'Código do grupo é obrigatório'
                });
            }

            const users = await UserGroupService.getUsersByGroup(groupCode);

            return res.json(users);
        } catch (error) {
            console.error('Erro no controller de grupos de usuários:', error);
            return res.status(500).json({
                error: 'Erro ao buscar usuários do grupo'
            });
        }
    }
}

export default new UserGroupController();
