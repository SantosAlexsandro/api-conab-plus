"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express'); var _express2 = _interopRequireDefault(_express); // Atualizado para usar 'import' no lugar de 'require'
var _CategoryControllerjs = require('../controllers/CategoryController.js'); var _CategoryControllerjs2 = _interopRequireDefault(_CategoryControllerjs); // Certifique-se de adicionar a extensão '.js'

const router = _express2.default.Router();

router.get('/categorias', _CategoryControllerjs2.default.getAll);
router.get('/categorias/:id', _CategoryControllerjs2.default.getById);

exports. default = router;
