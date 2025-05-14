import RolePermissionService from '../services/RolePermissionService';

class PermissionController {
  async create(req, res) {
    try {
      const { name, slug, description, module } = req.body;

      if (!name || !slug || !module) {
        return res.status(400).json({
          message: 'Nome, slug e módulo são obrigatórios'
        });
      }

      const permission = await RolePermissionService.createPermission({
        name,
        slug,
        description,
        module
      });

      return res.status(201).json(permission);
    } catch (error) {
      console.error('Erro ao criar permissão:', error);
      return res.status(400).json({ message: error.message });
    }
  }

  async index(req, res) {
    try {
      const { page, limit, search, module, active } = req.query;

      const isActive = active === 'true' ? true :
                     active === 'false' ? false : undefined;

      const result = await RolePermissionService.getPermissions({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        searchTerm: search,
        module,
        isActive,
      });

      return res.json(result);
    } catch (error) {
      console.error('Erro ao listar permissões:', error);
      return res.status(500).json({ message: 'Erro ao listar permissões' });
    }
  }
}

export default new PermissionController();
