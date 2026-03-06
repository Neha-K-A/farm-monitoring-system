import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js'
import {
  getCurrentWeather,
  getWeatherHistory,
  getSeasonalCropRecommendations,
  getMockWeather
} from '../controllers/weather.controller.js'

const router = express.Router()

router.get('/current/:farmId', verifyJWT, getCurrentWeather)
router.get('/history/:farmId', verifyJWT, getWeatherHistory)
router.get('/seasonal-crops', verifyJWT, getSeasonalCropRecommendations)
router.get('/mock', getMockWeather)

export default router
