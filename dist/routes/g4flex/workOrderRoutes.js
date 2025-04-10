"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _WorkOrderController = require('../../controllers/g4flex/WorkOrderController'); var _WorkOrderController2 = _interopRequireDefault(_WorkOrderController);

const router = new (0, _express.Router)();

router.get('/check-open', _WorkOrderController2.default.checkWorkOrder);

router.post('/requests', _WorkOrderController2.default.createWorkOrder);

router.post('/close', _WorkOrderController2.default.closeWorkOrder);

exports. default = router;
