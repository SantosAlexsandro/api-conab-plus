"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _ERPUserGroupService = require('../services/ERPUserGroupService'); var _ERPUserGroupService2 = _interopRequireDefault(_ERPUserGroupService);

class ERPUserGroupController {
  async getUsersByGroup(req, res) {
    try {
      const { groupCode } = req.params;

      if (!groupCode) {
        return res.status(400).json({
          errors: ['Código do grupo é obrigatório'],
        });
      }

      const users = await _ERPUserGroupService2.default.getUsersByGroup(groupCode);

      return res.json(users);
    } catch (error) {
      return res.status(500).json({
        errors: ['Erro ao buscar usuários do grupo'],
        details: error.message,
      });
    }
  }
}

exports. default = new ERPUserGroupController();
