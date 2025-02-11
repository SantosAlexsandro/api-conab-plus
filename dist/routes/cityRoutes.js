"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express'); var _express2 = _interopRequireDefault(_express);
var _CityController = require('../controllers/CityController'); var _CityController2 = _interopRequireDefault(_CityController);

const router = _express2.default.Router();

router.post('/sync', _CityController2.default.syncCities); // Sincronizar cidades do ERP
router.get('/', _CityController2.default.getAllCities); // Buscar todas as cidades
router.get('/:ibgeCityCod', _CityController2.default.show);

exports. default = router;
