import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js'
import { queryAI, getChatHistory } from '../controllers/ai.controller.js'

const router = express.Router()

// Query AI for agricultural advice
router.post('/query', verifyJWT, queryAI)

// Get chat history (future implementation)
router.get('/history', verifyJWT, getChatHistory)

export default router
