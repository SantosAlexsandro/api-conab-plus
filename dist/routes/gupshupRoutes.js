"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// authRoutes.js

var _express = require('express'); var _express2 = _interopRequireDefault(_express);
var _GupshupController = require('../controllers/GupshupController'); var _GupshupController2 = _interopRequireDefault(_GupshupController);

const router = _express2.default.Router();

router.post('/webhook', _GupshupController2.default.webhook);

exports. default = router;
