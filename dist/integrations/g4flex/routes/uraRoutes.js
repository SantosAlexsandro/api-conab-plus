"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _UraController = require('../controllers/UraController'); var _UraController2 = _interopRequireDefault(_UraController);

const router = new (0, _express.Router)();

// Rota para registrar falhas gerais da URA (endpoint público)
router.post('/failures', _UraController2.default.handleFailures);

exports. default = router;
