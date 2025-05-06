"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _TechnicianERPController = require('../controllers/TechnicianERPController'); var _TechnicianERPController2 = _interopRequireDefault(_TechnicianERPController);

const router = new (0, _express.Router)();

// Usando função anônima como wrapper para preservar o contexto this
router.get('/active', (req, res, next) => _TechnicianERPController2.default.getActiveTechnicians(req, res, next));

exports. default = router;
