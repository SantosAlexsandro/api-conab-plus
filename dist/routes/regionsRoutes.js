"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express'); var _express2 = _interopRequireDefault(_express); // Atualizado para usar 'import' no lugar de 'require'
var _RegionsControllerjs = require('../controllers/RegionsController.js'); var _RegionsControllerjs2 = _interopRequireDefault(_RegionsControllerjs); // Certifique-se de adicionar a extensão '.js'

const router = _express2.default.Router();

router.get('/regioes', _RegionsControllerjs2.default.getAll);
router.get('/regioes/:id', _RegionsControllerjs2.default.getById);

exports. default = router;
