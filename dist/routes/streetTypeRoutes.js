"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express'); var _express2 = _interopRequireDefault(_express); // Atualizado para usar 'import' no lugar de 'require'
var _StreetTypeController = require('../controllers/StreetTypeController'); var _StreetTypeController2 = _interopRequireDefault(_StreetTypeController); // Certifique-se de adicionar a extensão '.js'

const router = _express2.default.Router();

router.get('/', _StreetTypeController2.default.getAll);
router.get('/cities/:id', _StreetTypeController2.default.getById);

exports. default = router;
