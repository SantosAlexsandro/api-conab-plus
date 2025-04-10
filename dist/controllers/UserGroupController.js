"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _UserGroupService = require('../services/UserGroupService'); var _UserGroupService2 = _interopRequireDefault(_UserGroupService);

class UserGroupController {
    async getUsersByGroup(req, res) {
        try {
            const { groupCode } = req.params;

            if (!groupCode) {
                return res.status(400).json({
                    error: 'Código do grupo é obrigatório'
                });
            }

            const users = await _UserGroupService2.default.getUsersByGroup(groupCode);

            return res.json(users);
        } catch (error) {
            console.error('Erro no controller de grupos de usuários:', error);
            return res.status(500).json({
                error: 'Erro ao buscar usuários do grupo'
            });
        }
    }
}

exports. default = new UserGroupController();
