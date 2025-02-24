"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _EntityController = require('../controllers/EntityController'); var _EntityController2 = _interopRequireDefault(_EntityController);
var _authMiddleware = require('../middlewares/authMiddleware'); var _authMiddleware2 = _interopRequireDefault(_authMiddleware);

const router = new (0, _express.Router)();

router.get('/', _authMiddleware2.default, _EntityController2.default.getAll);
router.get('/:id', _authMiddleware2.default, _EntityController2.default.show);
router.get('/cnpjcpf', _authMiddleware2.default, _EntityController2.default.getByFilter);
router.get('/address&number', _authMiddleware2.default, _EntityController2.default.getByFilter);
router.post('/', _authMiddleware2.default, _EntityController2.default.create);
router.post('/edit', _authMiddleware2.default, _EntityController2.default.update);
router.post('/savePartialData', _authMiddleware2.default, _EntityController2.default.savePartialData);
//router.delete('/', loginRequired, entityController.delete);

exports. default = router;
