import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js'
import {
  addSoilRecord,
  getSoilRecords,
  getLatestSoilTest
} from '../controllers/soil.controller.js'

const router = express.Router()

router.post('/:farmId/test', verifyJWT, addSoilRecord)
router.get('/farm/:farmId', verifyJWT, getSoilRecords)
router.get('/farm/:farmId/latest', verifyJWT, getLatestSoilTest)

export default router
