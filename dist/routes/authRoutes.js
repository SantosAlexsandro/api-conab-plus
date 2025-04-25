"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// authRoutes.js

var _express = require('express'); var _express2 = _interopRequireDefault(_express);
var _AuthControllerjs = require('../controllers/AuthController.js'); var _AuthControllerjs2 = _interopRequireDefault(_AuthControllerjs);

const router = _express2.default.Router();

router.post('/login', _AuthControllerjs2.default.getByUserName);
router.post('/user', _AuthControllerjs2.default.login);

exports. default = router;
