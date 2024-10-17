"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express'); var _express2 = _interopRequireDefault(_express); // Atualizado para usar 'import' no lugar de 'require'
var _TypeAssistanceController = require('../controllers/TypeAssistanceController'); var _TypeAssistanceController2 = _interopRequireDefault(_TypeAssistanceController);

const router = _express2.default.Router();

router.get('/', _TypeAssistanceController2.default.getAll);

exports. default = router;
