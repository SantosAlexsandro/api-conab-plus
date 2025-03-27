"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _ERPUserGroupController = require('../controllers/ERPUserGroupController'); var _ERPUserGroupController2 = _interopRequireDefault(_ERPUserGroupController);
var _loginRequired = require('../middlewares/loginRequired'); var _loginRequired2 = _interopRequireDefault(_loginRequired);

// TODO: Adicionar loginRequired
const router = new (0, _express.Router)();

router.get('/:groupCode',  _ERPUserGroupController2.default.getUsersByGroup);

exports. default = router;
