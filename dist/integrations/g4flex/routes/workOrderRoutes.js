"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _WorkOrderController = require('../controllers/WorkOrderController'); var _WorkOrderController2 = _interopRequireDefault(_WorkOrderController);
var _authG4Flex = require('../middlewares/authG4Flex'); var _authG4Flex2 = _interopRequireDefault(_authG4Flex);

const router = new (0, _express.Router)();

router.get('/open', _authG4Flex2.default, _WorkOrderController2.default.getOpenOrders);

router.post('/requests', _authG4Flex2.default, _WorkOrderController2.default.requestWorkOrder);

router.post('/close', _authG4Flex2.default, _WorkOrderController2.default.closeWorkOrder);

exports. default = router;
