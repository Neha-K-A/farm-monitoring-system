import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js'
import { getPredictions } from '../controllers/analytics.controller.js'

const router = express.Router()

router.get('/predictions', verifyJWT, getPredictions)

export default router
