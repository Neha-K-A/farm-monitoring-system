import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js'
import {
  getSupportedLanguages,
  updateLanguagePreference,
  translateText
} from '../controllers/language.controller.js'

const router = express.Router()

router.get('/supported', getSupportedLanguages)
router.put('/preference', verifyJWT, updateLanguagePreference)
router.get('/translate', verifyJWT, translateText)

export default router
