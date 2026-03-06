import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js'
import {
  createCrop,
  getCrops,
  getCropById,
  updateCrop,
  deleteCrop,
  addInput,
  addDisease,
  addGrowthStage,
  getDueYields,
  calculateProfit
} from '../controllers/crop.controller.js'

const router = express.Router()

router.post('/', verifyJWT, createCrop)
router.get('/', verifyJWT, getCrops)
router.get('/due-yields', verifyJWT, getDueYields)
router.get('/:cropId', verifyJWT, getCropById)
router.put('/:cropId', verifyJWT, updateCrop)
router.delete('/:cropId', verifyJWT, deleteCrop)
router.post('/:cropId/input', verifyJWT, addInput)
router.post('/:cropId/disease', verifyJWT, addDisease)
router.post('/:cropId/growth-stage', verifyJWT, addGrowthStage)
router.get('/:cropId/profit', verifyJWT, calculateProfit)

export default router
