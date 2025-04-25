"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _ItemController = require('../controllers/ItemController'); var _ItemController2 = _interopRequireDefault(_ItemController);
var _authUser = require('../middlewares/authUser'); var _authUser2 = _interopRequireDefault(_authUser);

const router = new (0, _express.Router)();

router.get('/', _ItemController2.default.index);
router.post('/:id', _authUser2.default, _ItemController2.default.store);
router.put('/:id', _authUser2.default, _ItemController2.default.update);
router.get('/:id', _ItemController2.default.show);
router.delete('/:id', _authUser2.default, _ItemController2.default.delete);

exports. default = router;
