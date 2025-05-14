"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _RolePermissionService = require('../services/RolePermissionService'); var _RolePermissionService2 = _interopRequireDefault(_RolePermissionService);

class RoleController {
  async create(req, res) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Nome do perfil é obrigatório' });
      }

      const role = await _RolePermissionService2.default.createRole({ name, description });

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

      const role = await _RolePermissionService2.default.updateRole(id, {
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

      await _RolePermissionService2.default.deleteRole(id);

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

      const result = await _RolePermissionService2.default.getRoles({
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

      const role = await _RolePermissionService2.default.getRoleById(id);

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

      const role = await _RolePermissionService2.default.assignPermissionsToRole(
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

      await _RolePermissionService2.default.removePermissionFromRole(
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

exports. default = new RoleController();
