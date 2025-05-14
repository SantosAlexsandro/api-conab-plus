"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _UserSession = require('../models/UserSession'); var _UserSession2 = _interopRequireDefault(_UserSession);
var _Permission = require('../models/Permission'); var _Permission2 = _interopRequireDefault(_Permission);
var _sequelize = require('sequelize');

/**
 * Middleware para verificar permissões do usuário
 * @param {string|string[]} requiredPermissions - Slug ou array de slugs de permissões requeridas
 */
 function checkPermission(requiredPermissions) {
  return async (req, res, next) => {
    try {
      // Verifica se o usuário existe
      if (!req.userName) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      // Converte o parâmetro para array, caso seja uma string
      const permissionsToCheck = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      // Busca o usuário com suas roles e permissões
      const user = await _UserSession2.default.findOne({
        where: { userName: req.userName },
        include: {
          association: 'roles',
          include: {
            association: 'permissions',
            where: {
              slug: {
                [_sequelize.Op.in]: permissionsToCheck,
              },
              isActive: true,
            },
            required: false,
          },
          required: false,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Verifica se o usuário possui pelo menos uma das permissões requeridas
      const userPermissions = user.roles.flatMap(
        (role) => role.permissions.map((permission) => permission.slug)
      );

      const hasPermission = permissionsToCheck.some(
        (permission) => userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          message: "Você não tem permissão para acessar este recurso",
        });
      }

      // Se chegou aqui, o usuário tem permissão
      next();
    } catch (error) {
      console.error("Erro ao verificar permissões:", error);
      return res.status(500).json({
        message: "Erro ao verificar permissões",
        error: error.message,
      });
    }
  };
} exports.default = checkPermission;
