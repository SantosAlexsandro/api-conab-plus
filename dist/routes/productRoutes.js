"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express'); var _express2 = _interopRequireDefault(_express); // Atualizado para usar 'import' no lugar de 'require'
var _ProductController = require('../controllers/ProductController'); var _ProductController2 = _interopRequireDefault(_ProductController);

const router = _express2.default.Router();

router.get('/', _ProductController2.default.getAll);

exports. default = router;
