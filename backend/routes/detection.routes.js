import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js'
import { uploadSingle } from '../middleware/upload.middleware.js'
import {
  detectFromImage,
  getDetectionResults,
  getPipelineStatus
} from '../controllers/detection.controller.js'

const router = express.Router()

router.get('/status', getPipelineStatus)
router.post('/detect/image', verifyJWT, uploadSingle('image'), detectFromImage)
router.get('/results', verifyJWT, getDetectionResults)

export default router
