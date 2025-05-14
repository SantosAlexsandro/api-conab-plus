import Role from '../models/Role';
import Permission from '../models/Permission';
import UserRole from '../models/UserRole';
import RolePermission from '../models/RolePermission';
import { Op } from 'sequelize';
import UserSession from '../models/UserSession';

class RolePermissionService {
  async createRole({ name, description }) {
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      throw new Error(`Perfil com nome '${name}' já existe.`);
    }

    return Role.create({ name, description });
  }

  async updateRole(id, { name, description, isActive }) {
    const role = await Role.findByPk(id);
    if (!role) {
      throw new Error(`Perfil com ID ${id} não encontrado.`);
    }

    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ where: { name } });
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
    const role = await Role.findByPk(id);
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
      where.name = { [Op.iLike]: `%${searchTerm}%` };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const { count, rows } = await Role.findAndCountAll({
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
    const role = await Role.findByPk(id, {
      include: {
        model: Permission,
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
    const existingPermission = await Permission.findOne({
      where: {
        [Op.or]: [{ name }, { slug }],
      },
    });

    if (existingPermission) {
      throw new Error(`Permissão com nome '${name}' ou slug '${slug}' já existe.`);
    }

    return Permission.create({ name, slug, description, module });
  }

  async getPermissions(options = {}) {
    const { page = 1, limit = 10, searchTerm, module, isActive } = options;
    const offset = (page - 1) * limit;

    const where = {};

    if (searchTerm) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${searchTerm}%` } },
        { slug: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (module) {
      where.module = module;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const { count, rows } = await Permission.findAndCountAll({
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
    const role = await Role.findByPk(roleId);
    if (!role) {
      throw new Error(`Perfil com ID ${roleId} não encontrado.`);
    }

    // Validar todas as permissões antes de criar as associações
    const permissions = await Permission.findAll({
      where: { id: { [Op.in]: permissionIds } },
    });

    if (permissions.length !== permissionIds.length) {
      throw new Error('Uma ou mais permissões não foram encontradas');
    }

    // Criar as associações entre perfil e permissões
    const rolePermissions = permissionIds.map(permissionId => ({
      roleId,
      permissionId,
    }));

    await RolePermission.bulkCreate(rolePermissions, {
      updateOnDuplicate: ['updatedAt']
    });

    return this.getRoleById(roleId);
  }

  async removePermissionFromRole(roleId, permissionId) {
    const rolePermission = await RolePermission.findOne({
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
    const role = await Role.findByPk(roleId);
    if (!role) {
      throw new Error(`Perfil com ID ${roleId} não encontrado.`);
    }

    await UserRole.create({ userName, roleId });
    return true;
  }

  async removeRoleFromUser(userName, roleId) {
    const userRole = await UserRole.findOne({
      where: { userName, roleId },
    });

    if (!userRole) {
      throw new Error(`Associação entre usuário '${userName}' e perfil ID ${roleId} não encontrada.`);
    }

    await userRole.destroy();
    return true;
  }

  async getUserRoles(userName) {
    try {
      const userSession = await UserSession.findOne({
        where: { userName },
        include: {
          model: Role,
          as: 'roles',
          include: {
            model: Permission,
            as: 'permissions',
            through: { attributes: [] }
          }
        }
      });

      if (!userSession) {
        return [];
      }

      return userSession.roles || [];
    } catch (error) {
      console.error('Erro ao buscar perfis do usuário:', error);
      throw error;
    }
  }
}

export default new RolePermissionService();
