import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js'
import { getDashboardSummary } from '../controllers/dashboard.controller.js'

const router = express.Router()

router.get('/summary', verifyJWT, getDashboardSummary)

export default router
