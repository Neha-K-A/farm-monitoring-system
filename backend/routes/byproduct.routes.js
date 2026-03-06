import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js'
import {
  createByProduct,
  getByProducts,
  getByProductSuggestions,
  updateByProduct,
  deleteByProduct
} from '../controllers/byproduct.controller.js'

const router = express.Router()

router.post('/', verifyJWT, createByProduct)
router.get('/', getByProducts)
router.get('/suggestions', getByProductSuggestions)
router.put('/:id', verifyJWT, updateByProduct)
router.delete('/:id', verifyJWT, deleteByProduct)

export default router
