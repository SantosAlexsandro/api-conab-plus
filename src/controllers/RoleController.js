import RolePermissionService from '../services/RolePermissionService';

class RoleController {
  async create(req, res) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Nome do perfil é obrigatório' });
      }

      const role = await RolePermissionService.createRole({ name, description });

      return res.status(201).json(role);
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      return res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, isActive } = req.body;

      const role = await RolePermissionService.updateRole(id, {
        name,
        description,
        isActive
      });

      return res.json(role);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      await RolePermissionService.deleteRole(id);

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao excluir perfil:', error);
      return res.status(400).json({ message: error.message });
    }
  }

  async index(req, res) {
    try {
      const { page, limit, search, active } = req.query;

      const isActive = active === 'true' ? true :
                     active === 'false' ? false : undefined;

      const result = await RolePermissionService.getRoles({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        searchTerm: search,
        isActive,
      });

      return res.json(result);
    } catch (error) {
      console.error('Erro ao listar perfis:', error);
      return res.status(500).json({ message: 'Erro ao listar perfis' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;

      const role = await RolePermissionService.getRoleById(id);

      return res.json(role);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return res.status(404).json({ message: error.message });
    }
  }

  async assignPermissions(req, res) {
    try {
      const { id } = req.params;
      const { permissionIds } = req.body;

      if (!Array.isArray(permissionIds)) {
        return res.status(400).json({
          message: 'permissionIds deve ser um array de IDs'
        });
      }

      const role = await RolePermissionService.assignPermissionsToRole(
        id,
        permissionIds
      );

      return res.json(role);
    } catch (error) {
      console.error('Erro ao atribuir permissões ao perfil:', error);
      return res.status(400).json({ message: error.message });
    }
  }

  async removePermission(req, res) {
    try {
      const { roleId, permissionId } = req.params;

      await RolePermissionService.removePermissionFromRole(
        roleId,
        permissionId
      );

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao remover permissão do perfil:', error);
      return res.status(400).json({ message: error.message });
    }
  }
}

export default new RoleController();
