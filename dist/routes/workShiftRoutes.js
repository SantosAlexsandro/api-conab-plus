"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _WorkShiftController = require('../controllers/WorkShiftController'); var _WorkShiftController2 = _interopRequireDefault(_WorkShiftController);
var _loginRequired = require('../middlewares/loginRequired'); var _loginRequired2 = _interopRequireDefault(_loginRequired);

const router = new (0, _express.Router)();

router.get('/', _loginRequired2.default, _WorkShiftController2.default.index);
router.post('/', _WorkShiftController2.default.store);
router.get('/:id', _loginRequired2.default, _WorkShiftController2.default.show);
router.put('/:id', _loginRequired2.default, _WorkShiftController2.default.update);
//router.delete('/:id', loginRequired, workShiftController.delete);

exports. default = router;
