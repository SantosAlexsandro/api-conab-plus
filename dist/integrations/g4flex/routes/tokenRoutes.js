"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _TokenController = require('../controllers/TokenController'); var _TokenController2 = _interopRequireDefault(_TokenController);

const router = new (0, _express.Router)();

// Rota para autenticação G4Flex
router.post('/', _TokenController2.default.authenticate);

exports. default = router;
