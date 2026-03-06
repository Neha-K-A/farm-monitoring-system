import express from 'express'
import {
  registerFarmer,
  loginFarmer,
  refreshAccessToken,
  logoutFarmer,
  getCurrentUser
} from '../controllers/auth.controller.js'
import { verifyJWT } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/register', registerFarmer)
router.post('/login', loginFarmer)
router.post('/refresh-token', refreshAccessToken)
router.post('/logout', verifyJWT, logoutFarmer)
router.get('/me', verifyJWT, getCurrentUser)

export default router
