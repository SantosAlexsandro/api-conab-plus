"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _ContractController = require('../controllers/ContractController'); var _ContractController2 = _interopRequireDefault(_ContractController);
var _authG4Flex = require('../middlewares/authG4Flex'); var _authG4Flex2 = _interopRequireDefault(_authG4Flex);

const router = _express.Router.call(void 0, );

router.get('/check-active', _authG4Flex2.default, _ContractController2.default.checkContract);

exports. default = router;
