"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _Role = require('../models/Role'); var _Role2 = _interopRequireDefault(_Role);
var _Permission = require('../models/Permission'); var _Permission2 = _interopRequireDefault(_Permission);
var _UserRole = require('../models/UserRole'); var _UserRole2 = _interopRequireDefault(_UserRole);
var _RolePermission = require('../models/RolePermission'); var _RolePermission2 = _interopRequireDefault(_RolePermission);
var _sequelize = require('sequelize');

class RolePermissionService {
  async createRole({ name, description }) {
    const existingRole = await _Role2.default.findOne({ where: { name } });
    if (existingRole) {
      throw new Error(`Perfil com nome '${name}' já existe.`);
    }

    return _Role2.default.create({ name, description });
  }

  async updateRole(id, { name, description, isActive }) {
    const role = await _Role2.default.findByPk(id);
    if (!role) {
      throw new Error(`Perfil com ID ${id} não encontrado.`);
    }

    if (name && name !== role.name) {
      const existingRole = await _Role2.default.findOne({ where: { name } });
      if (existingRole) {
        throw new Error(`Perfil com nome '${name}' já existe.`);
      }
    }

    return role.update({
      name: name || role.name,
      description: description !== undefined ? description : role.description,
      isActive: isActive !== undefined ? isActive : role.isActive
    });
  }

  async deleteRole(id) {
    const role = await _Role2.default.findByPk(id);
    if (!role) {
      throw new Error(`Perfil com ID ${id} não encontrado.`);
    }

    return role.destroy();
  }

  async getRoles(options = {}) {
    const { page = 1, limit = 10, searchTerm, isActive } = options;
    const offset = (page - 1) * limit;

    const where = {};

    if (searchTerm) {
      where.name = { [_sequelize.Op.iLike]: `%${searchTerm}%` };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const { count, rows } = await _Role2.default.findAndCountAll({
      where,
      limit,
      offset,
      order: [['name', 'ASC']],
    });

    return {
      roles: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    };
  }

  async getRoleById(id) {
    const role = await _Role2.default.findByPk(id, {
      include: {
        model: _Permission2.default,
        as: 'permissions',
        through: { attributes: [] },
      },
    });

    if (!role) {
      throw new Error(`Perfil com ID ${id} não encontrado.`);
    }

    return role;
  }

  async createPermission({ name, slug, description, module }) {
    const existingPermission = await _Permission2.default.findOne({
      where: {
        [_sequelize.Op.or]: [{ name }, { slug }],
      },
    });

    if (existingPermission) {
      throw new Error(`Permissão com nome '${name}' ou slug '${slug}' já existe.`);
    }

    return _Permission2.default.create({ name, slug, description, module });
  }

  async getPermissions(options = {}) {
    const { page = 1, limit = 10, searchTerm, module, isActive } = options;
    const offset = (page - 1) * limit;

    const where = {};

    if (searchTerm) {
      where[_sequelize.Op.or] = [
        { name: { [_sequelize.Op.iLike]: `%${searchTerm}%` } },
        { slug: { [_sequelize.Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (module) {
      where.module = module;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const { count, rows } = await _Permission2.default.findAndCountAll({
      where,
      limit,
      offset,
      order: [['module', 'ASC'], ['name', 'ASC']],
    });

    return {
      permissions: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    };
  }

  async assignPermissionsToRole(roleId, permissionIds) {
    const role = await _Role2.default.findByPk(roleId);
    if (!role) {
      throw new Error(`Perfil com ID ${roleId} não encontrado.`);
    }

    // Validar todas as permissões antes de criar as associações
    const permissions = await _Permission2.default.findAll({
      where: { id: { [_sequelize.Op.in]: permissionIds } },
    });

    if (permissions.length !== permissionIds.length) {
      throw new Error('Uma ou mais permissões não foram encontradas');
    }

    // Criar as associações entre perfil e permissões
    const rolePermissions = permissionIds.map(permissionId => ({
      roleId,
      permissionId,
    }));

    await _RolePermission2.default.bulkCreate(rolePermissions, {
      updateOnDuplicate: ['updatedAt']
    });

    return this.getRoleById(roleId);
  }

  async removePermissionFromRole(roleId, permissionId) {
    const rolePermission = await _RolePermission2.default.findOne({
      where: { roleId, permissionId },
    });

    if (!rolePermission) {
      throw new Error(`Associação entre perfil ID ${roleId} e permissão ID ${permissionId} não encontrada.`);
    }

    await rolePermission.destroy();
    return true;
  }

  async assignRoleToUser(userName, roleId) {
    // Verificar se o papel existe
    const role = await _Role2.default.findByPk(roleId);
    if (!role) {
      throw new Error(`Perfil com ID ${roleId} não encontrado.`);
    }

    await _UserRole2.default.create({ userName, roleId });
    return true;
  }

  async removeRoleFromUser(userName, roleId) {
    const userRole = await _UserRole2.default.findOne({
      where: { userName, roleId },
    });

    if (!userRole) {
      throw new Error(`Associação entre usuário '${userName}' e perfil ID ${roleId} não encontrada.`);
    }

    await userRole.destroy();
    return true;
  }

  async getUserRoles(userName) {
    const roles = await _Role2.default.findAll({
      include: [{
        model: _UserRole2.default,
        as: 'userRoles',
        where: { userName },
        required: true,
        attributes: [],
      }],
    });

    return roles;
  }
}

exports. default = new RolePermissionService();
