"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _WorkOrderPhotoController = require('../controllers/WorkOrderPhotoController'); var _WorkOrderPhotoController2 = _interopRequireDefault(_WorkOrderPhotoController);
var _authUser = require('../middlewares/authUser'); var _authUser2 = _interopRequireDefault(_authUser);
var _multerConfig = require('../config/multerConfig'); // Importa as duas opções

const router = new (0, _express.Router)();

router.post('/upload', _multerConfig.uploadToMemory.single('photo'), _WorkOrderPhotoController2.default.uploadPhoto);

exports. default = router;
