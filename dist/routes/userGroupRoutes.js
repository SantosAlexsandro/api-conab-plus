"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express'); var _express2 = _interopRequireDefault(_express);
var _UserGroupController = require('../controllers/UserGroupController'); var _UserGroupController2 = _interopRequireDefault(_UserGroupController);

const router = _express2.default.Router();

router.get('/:groupCode/users', (req, res) => _UserGroupController2.default.getUsersByGroup(req, res));

exports. default = router;
