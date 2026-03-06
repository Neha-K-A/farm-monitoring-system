import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/role.middleware.js'
import {
  getAllSchemes,
  getRelevantSchemes,
  getSchemeById,
  seedSchemes
} from '../controllers/scheme.controller.js'

const router = express.Router()

router.get('/', getAllSchemes)
router.get('/relevant', verifyJWT, getRelevantSchemes)
router.get('/:id', getSchemeById)
router.post('/seed', verifyJWT, authorize('admin'), seedSchemes)

export default router
