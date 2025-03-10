"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _WorkOrderController = require('../controllers/WorkOrderController'); var _WorkOrderController2 = _interopRequireDefault(_WorkOrderController);
var _loginRequired = require('../middlewares/loginRequired'); var _loginRequired2 = _interopRequireDefault(_loginRequired);

const router = new (0, _express.Router)();

router.get('/', _WorkOrderController2.default.getAll);
router.get('/tech', _WorkOrderController2.default.getAllbyTech);
// router.get('/:id', entityController.show); // Lista usuário - Não deveria existir
router.post('/', _WorkOrderController2.default.create);
router.post('/updateStage', _WorkOrderController2.default.updateOrderStage);
router.get('/nextStages', _WorkOrderController2.default.getNextStages);
//router.put('/', loginRequired, entityController.update);
//router.delete('/', loginRequired, entityController.delete);

exports. default = router;
