"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _WorkOrderController = require('../controllers/WorkOrderController'); var _WorkOrderController2 = _interopRequireDefault(_WorkOrderController);
var _loginRequired = require('../middlewares/loginRequired'); var _loginRequired2 = _interopRequireDefault(_loginRequired);

const router = new (0, _express.Router)();

router.get('/', _WorkOrderController2.default.getAll);
// router.get('/:id', entityController.show); // Lista usuário - Não deveria existir
router.post('/', _WorkOrderController2.default.create);
//router.put('/', loginRequired, entityController.update);
//router.delete('/', loginRequired, entityController.delete);

exports. default = router;
