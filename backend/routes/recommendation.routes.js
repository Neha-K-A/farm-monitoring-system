import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js'
import {
  getCropRecommendations,
  getIrrigationRecommendations,
  getOrganicFarmingGuide,
  getModernToolsRecommendations
} from '../controllers/recommendation.controller.js'

const router = express.Router()

router.get('/crop/:farmId', verifyJWT, getCropRecommendations)
router.get('/irrigation/:farmId', verifyJWT, getIrrigationRecommendations)
router.get('/organic', getOrganicFarmingGuide)
router.get('/modern-tools', getModernToolsRecommendations)

export default router
