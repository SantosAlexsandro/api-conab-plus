"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _RolePermissionService = require('../services/RolePermissionService'); var _RolePermissionService2 = _interopRequireDefault(_RolePermissionService);
var _permissionHelper = require('../helpers/permissionHelper');

class UserRoleController {
  async assignRole(req, res) {
    try {
      const { userName } = req.params;
      const { roleId } = req.body;

      if (!roleId) {
        return res.status(400).json({ message: 'ID do perfil é obrigatório' });
      }

      await _RolePermissionService2.default.assignRoleToUser(userName, roleId);

      return res.status(201).json({ message: 'Perfil atribuído com sucesso' });
    } catch (error) {
      console.error('Erro ao atribuir perfil ao usuário:', error);
      return res.status(400).json({ message: error.message });
    }
  }

  async removeRole(req, res) {
    try {
      const { userName, roleId } = req.params;

      await _RolePermissionService2.default.removeRoleFromUser(userName, roleId);

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao remover perfil do usuário:', error);
      return res.status(400).json({ message: error.message });
    }
  }

  async getUserRoles(req, res) {
    try {
      const { userName } = req.params;

      // Verificar se o usuário está tentando ver seus próprios perfis
      const isSelfRequest = req.userName === userName;

      // Permitir visualização dos próprios perfis sem verificação de permissão
      if (!isSelfRequest) {
        // Verifica se tem permissão para ver perfis de outros usuários
        const hasPermission = await _permissionHelper.checkPermissionHelper.call(void 0, req.userName, 'users.view_roles');
        if (!hasPermission) {
          return res.status(403).json({ message: 'Permissão negada para visualizar perfis de outros usuários' });
        }
      }

      const roles = await _RolePermissionService2.default.getUserRoles(userName);

      return res.json(roles);
    } catch (error) {
      console.error('Erro ao buscar perfis do usuário:', error);
      return res.status(500).json({ message: 'Erro ao buscar perfis do usuário' });
    }
  }
}

exports. default = new UserRoleController();
