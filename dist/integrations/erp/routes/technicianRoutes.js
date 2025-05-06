"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _TechnicianERPController = require('../controllers/TechnicianERPController'); var _TechnicianERPController2 = _interopRequireDefault(_TechnicianERPController);

const router = new (0, _express.Router)();

router.get('/active', _TechnicianERPController2.default.getActiveTechnicians);

exports. default = router;
