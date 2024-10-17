"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express'); var _express2 = _interopRequireDefault(_express); // Atualizado para usar 'import' no lugar de 'require'
var _TypeServOrdController = require('../controllers/TypeServOrdController'); var _TypeServOrdController2 = _interopRequireDefault(_TypeServOrdController);

const router = _express2.default.Router();

router.get('/', _TypeServOrdController2.default.getAll);

exports. default = router;
