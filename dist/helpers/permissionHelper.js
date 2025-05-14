"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _UserSession = require('../models/UserSession'); var _UserSession2 = _interopRequireDefault(_UserSession);
var _sequelize = require('sequelize');

/**
 * Verifica se o usuário possui a permissão especificada
 * @param {string} userName - Nome do usuário
 * @param {string|string[]} requiredPermissions - Permissão ou lista de permissões necessárias
 * @returns {Promise<boolean>} - True se o usuário tem a permissão, false caso contrário
 */
 const checkPermissionHelper = async (userName, requiredPermissions) => {
  try {
    // Converte o parâmetro para array
    const permissionsToCheck = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    // Busca o usuário com suas roles e permissões
    const user = await _UserSession2.default.findOne({
      where: { userName },
      include: {
        association: 'roles',
        include: {
          association: 'permissions',
          where: {
            slug: { [_sequelize.Op.in]: permissionsToCheck },
            isActive: true
          },
          required: false
        },
        required: false
      }
    });

    if (!user) return false;

    // Verifica se o usuário possui permissão
    const userPermissions = user.roles.flatMap(
      role => role.permissions.map(permission => permission.slug)
    );

    return permissionsToCheck.some(
      permission => userPermissions.includes(permission)
    );
  } catch (error) {
    console.error("Erro ao verificar permissões:", error);
    return false;
  }
}; exports.checkPermissionHelper = checkPermissionHelper;
