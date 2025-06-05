"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _EntityController = require('../controllers/EntityController'); var _EntityController2 = _interopRequireDefault(_EntityController);
var _authUser = require('../middlewares/authUser'); var _authUser2 = _interopRequireDefault(_authUser);

const router = new (0, _express.Router)();

router.get('/', _authUser2.default, _EntityController2.default.getAll);
router.get('/search', _authUser2.default, _EntityController2.default.getByFilter);
router.get('/:id', _authUser2.default, _EntityController2.default.show);
router.post('/', _authUser2.default, _EntityController2.default.create);
router.post('/edit', _authUser2.default, _EntityController2.default.update);
router.post('/savePartialData', _authUser2.default, _EntityController2.default.savePartialData);
//router.delete('/', authUser, entityController.delete);

exports. default = router;
