"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');
var _WorkOrderAudioControllerjs = require('../controllers/WorkOrderAudioController.js'); var _WorkOrderAudioControllerjs2 = _interopRequireDefault(_WorkOrderAudioControllerjs);
var _multerConfigjs = require('../config/multerConfig.js');

const router = _express.Router.call(void 0, );

// Rota para upload de áudio
router.post("/upload", _multerConfigjs.uploadAudioToMemory.single('audio'), _WorkOrderAudioControllerjs2.default.uploadAudio);

exports. default = router;