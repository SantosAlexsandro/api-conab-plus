"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _multer = require('multer'); var _multer2 = _interopRequireDefault(_multer);
var _path = require('path');

// Função para gerar um nome de arquivo único
const generateRandomName = () => Math.floor(Math.random() * 10000 + 10000);

// Configuração de armazenamento na memória (RAM)
const memoryStorage = _multer2.default.memoryStorage();

// Configuração de armazenamento no disco
const diskStorage = _multer2.default.diskStorage({
  destination: (req, file, cb) => {
    cb(null, _path.resolve.call(void 0, __dirname, '..', '..', 'uploads', 'images'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${generateRandomName()}${_path.extname.call(void 0, file.originalname)}`);
  },
});

// Validação de arquivos de imagem
const imageFileFilter = (req, file, cb) => {
  if (!['image/png', 'image/jpeg'].includes(file.mimetype)) {
    return cb(new _multer2.default.MulterError('LIMIT_UNEXPECTED_FILE'), false);
  }
  return cb(null, true);
};

// Validação de arquivos de áudio
const audioFileFilter = (req, file, cb) => {
  if (!file.originalname.endsWith('.webm')) {
    return cb(new _multer2.default.MulterError('LIMIT_UNEXPECTED_FILE'), false);
  }
  return cb(null, true);
};

// Criamos as instâncias de `multer` para diferentes tipos de arquivo
 const uploadToMemory = _multer2.default.call(void 0, {
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
}); exports.uploadToMemory = uploadToMemory;

 const uploadToDisk = _multer2.default.call(void 0, {
  storage: diskStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}); exports.uploadToDisk = uploadToDisk;

 const uploadAudioToMemory = _multer2.default.call(void 0, {
  storage: memoryStorage,
  fileFilter: audioFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
}); exports.uploadAudioToMemory = uploadAudioToMemory;
