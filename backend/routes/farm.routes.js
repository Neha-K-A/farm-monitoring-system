import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js'
import {
  createFarm,
  getFarms,
  getFarmById,
  updateFarm,
  deleteFarm,
  getFarmSummary
} from '../controllers/farm.controller.js'

const router = express.Router()

router.post('/', verifyJWT, createFarm)
router.get('/', verifyJWT, getFarms)
router.get('/:farmId', verifyJWT, getFarmById)
router.put('/:farmId', verifyJWT, updateFarm)
router.delete('/:farmId', verifyJWT, deleteFarm)
router.get('/:farmId/summary', verifyJWT, getFarmSummary)

export default router
