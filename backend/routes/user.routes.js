import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js'
import { uploadSingle } from '../middleware/upload.middleware.js'
import {
  getProfile,
  updateProfile,
  updateHealthProfile,
  uploadProfilePhoto,
  getWomenJournal,
  getWomenFriendlyTools,
  deleteAccount
} from '../controllers/user.controller.js'

const router = express.Router()

router.get('/profile', verifyJWT, getProfile)
router.put('/profile', verifyJWT, updateProfile)
router.put('/health-profile', verifyJWT, updateHealthProfile)
router.post('/upload-photo', verifyJWT, uploadSingle('photo'), uploadProfilePhoto)
router.get('/women/journal', getWomenJournal)
router.get('/women/tools', getWomenFriendlyTools)
router.delete('/account', verifyJWT, deleteAccount)

export default router
