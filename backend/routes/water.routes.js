import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js'
import {
  logWaterUsage,
  getWaterLogs,
  getWaterStats,
  setWaterTarget
} from '../controllers/water.controller.js'

const router = express.Router()

router.post('/log', verifyJWT, logWaterUsage)
router.get('/farm/:farmId', verifyJWT, getWaterLogs)
router.get('/farm/:farmId/stats', verifyJWT, getWaterStats)
router.put('/farm/:farmId/target', verifyJWT, setWaterTarget)

export default router
