import { Router } from "express";
import workOrderAudioController from "../controllers/WorkOrderAudioController.js";
import { uploadAudioToMemory } from "../config/multerConfig.js";

const router = Router();

// Rota para upload de áudio
router.post("/upload", uploadAudioToMemory.single('audio'), workOrderAudioController.uploadAudio);

export default router;