"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _EntityController = require('../controllers/EntityController'); var _EntityController2 = _interopRequireDefault(_EntityController);
var _loginRequired = require('../middlewares/loginRequired'); var _loginRequired2 = _interopRequireDefault(_loginRequired);
var _authMiddleware = require('../middlewares/authMiddleware'); var _authMiddleware2 = _interopRequireDefault(_authMiddleware);

const router = new (0, _express.Router)();

router.get('/', _authMiddleware2.default, _EntityController2.default.getAll);
router.get('/:id', _EntityController2.default.show);
router.post('/', _EntityController2.default.create);
//router.put('/', loginRequired, entityController.update);
//router.delete('/', loginRequired, entityController.delete);

exports. default = router;
