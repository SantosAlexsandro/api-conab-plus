"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express'); var _express2 = _interopRequireDefault(_express); // Atualizado para usar 'import' no lugar de 'require'
var _AddressController = require('../controllers/AddressController'); var _AddressController2 = _interopRequireDefault(_AddressController); // Certifique-se de adicionar a extensão '.js'

const router = _express2.default.Router();

router.get('/address/:zipcode', _AddressController2.default.getByZipCode);

exports. default = router;
