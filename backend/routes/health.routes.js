import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js'
import {
  logHealth,
  getHealthLogs,
  getHealthSummary,
  getHealthTips
} from '../controllers/health.controller.js'

const router = express.Router()

router.post('/log', verifyJWT, logHealth)
router.get('/logs', verifyJWT, getHealthLogs)
router.get('/summary', verifyJWT, getHealthSummary)
router.get('/tips', verifyJWT, getHealthTips)
router.post('/log/legacy', verifyJWT, logHealth) // alias for backward compatibility

export default router
