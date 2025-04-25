"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _WorkShiftController = require('../controllers/WorkShiftController'); var _WorkShiftController2 = _interopRequireDefault(_WorkShiftController);
var _WorkShiftValidator = require('../validators/WorkShiftValidator');
var _authUser = require('../middlewares/authUser'); var _authUser2 = _interopRequireDefault(_authUser);
var _validation = require('../middlewares/validation'); var _validation2 = _interopRequireDefault(_validation);

const router = new (0, _express.Router)();

// Rotas básicas CRUD
router.get('/', _WorkShiftController2.default.index);
router.post('/', _WorkShiftValidator.WorkShiftValidator.validateStore(), _validation2.default, _WorkShiftController2.default.store);
router.get('/:id', _WorkShiftValidator.WorkShiftValidator.validateId(), _validation2.default, _WorkShiftController2.default.show);
router.put('/:id', _WorkShiftValidator.WorkShiftValidator.validateUpdate(), _validation2.default, _WorkShiftController2.default.update);
router.delete('/:id', _WorkShiftValidator.WorkShiftValidator.validateId(), _validation2.default, _WorkShiftController2.default.delete);

// Rotas específicas
router.get('/active', _WorkShiftController2.default.getActiveShifts);
router.get('/user/:userCode', _WorkShiftValidator.WorkShiftValidator.validateUserCode(), _validation2.default, _WorkShiftController2.default.getUserShifts);
router.get('/date-range', _WorkShiftValidator.WorkShiftValidator.validateDateRange(), _validation2.default, _WorkShiftController2.default.getShiftsByDateRange);
router.post('/check-overlap', _WorkShiftValidator.WorkShiftValidator.validateOverlapCheck(), _validation2.default, _WorkShiftController2.default.checkOverlap);

exports. default = router;
