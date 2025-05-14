import RolePermissionService from '../services/RolePermissionService';

class UserRoleController {
  async assignRole(req, res) {
    try {
      const { userName } = req.params;
      const { roleId } = req.body;

      if (!roleId) {
        return res.status(400).json({ message: 'ID do perfil é obrigatório' });
      }

      await RolePermissionService.assignRoleToUser(userName, roleId);

      return res.status(201).json({ message: 'Perfil atribuído com sucesso' });
    } catch (error) {
      console.error('Erro ao atribuir perfil ao usuário:', error);
      return res.status(400).json({ message: error.message });
    }
  }

  async removeRole(req, res) {
    try {
      const { userName, roleId } = req.params;

      await RolePermissionService.removeRoleFromUser(userName, roleId);

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao remover perfil do usuário:', error);
      return res.status(400).json({ message: error.message });
    }
  }

  async getUserRoles(req, res) {
    try {
      const { userName } = req.params;

      const roles = await RolePermissionService.getUserRoles(userName);

      return res.json(roles);
    } catch (error) {
      console.error('Erro ao buscar perfis do usuário:', error);
      return res.status(500).json({ message: 'Erro ao buscar perfis do usuário' });
    }
  }
}

export default new UserRoleController();
