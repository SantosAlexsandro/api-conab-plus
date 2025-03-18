import multer from 'multer';
import { extname, resolve } from 'path';

// Função para gerar um nome de arquivo único
const generateRandomName = () => Math.floor(Math.random() * 10000 + 10000);

// Configuração de armazenamento na memória (RAM)
const memoryStorage = multer.memoryStorage();

// Configuração de armazenamento no disco
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resolve(__dirname, '..', '..', 'uploads', 'images'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${generateRandomName()}${extname(file.originalname)}`);
  },
});

// Validação de arquivos de imagem
const imageFileFilter = (req, file, cb) => {
  if (!['image/png', 'image/jpeg'].includes(file.mimetype)) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'), false);
  }
  return cb(null, true);
};

// Validação de arquivos de áudio
const audioFileFilter = (req, file, cb) => {
  if (!file.originalname.endsWith('.webm')) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'), false);
  }
  return cb(null, true);
};

// Criamos as instâncias de `multer` para diferentes tipos de arquivo
export const uploadToMemory = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

export const uploadToDisk = multer({
  storage: diskStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadAudioToMemory = multer({
  storage: memoryStorage,
  fileFilter: audioFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});
