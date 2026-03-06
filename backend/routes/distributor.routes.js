import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js'
import {
  getDistributors,
  getNearbyDistributors,
  getDistributorById
} from '../controllers/distributor.controller.js'

const router = express.Router()

router.get('/', getDistributors)
router.get('/nearby', verifyJWT, getNearbyDistributors)
router.get('/:id', getDistributorById)

export default router
