import erpUserGroupService from '../services/ERPUserGroupService';

class ERPUserGroupController {
  async getUsersByGroup(req, res) {
    try {
      const { groupCode } = req.params;

      if (!groupCode) {
        return res.status(400).json({
          errors: ['Código do grupo é obrigatório'],
        });
      }

      const users = await erpUserGroupService.getUsersByGroup(groupCode);

      return res.json(users);
    } catch (error) {
      return res.status(500).json({
        errors: ['Erro ao buscar usuários do grupo'],
        details: error.message,
      });
    }
  }
}

export default new ERPUserGroupController();
