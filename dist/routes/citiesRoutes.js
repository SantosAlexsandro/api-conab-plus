"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express'); var _express2 = _interopRequireDefault(_express); // Atualizado para usar 'import' no lugar de 'require'
var _CitiesControllerjs = require('../controllers/CitiesController.js'); var _CitiesControllerjs2 = _interopRequireDefault(_CitiesControllerjs); // Certifique-se de adicionar a extensão '.js'

const router = _express2.default.Router();

router.get('/', _CitiesControllerjs2.default.getAll);
router.get('/cities/:id', _CitiesControllerjs2.default.getById);

exports. default = router;
