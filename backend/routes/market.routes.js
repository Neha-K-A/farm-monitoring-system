import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js'
import { uploadSingle } from '../middleware/upload.middleware.js'
import {
  createListing,
  getListings,
  getMyListings,
  getListingById,
  updateListing,
  deleteListing,
  sendInquiry
} from '../controllers/market.controller.js'

const router = express.Router()

router.post('/listings', verifyJWT, uploadSingle('photo'), createListing)
router.get('/listings', getListings)
router.get('/my-listings', verifyJWT, getMyListings)
router.get('/listings/:id', getListingById)
router.put('/listings/:id', verifyJWT, updateListing)
router.delete('/listings/:id', verifyJWT, deleteListing)
router.post('/listings/:id/inquire', verifyJWT, sendInquiry)

export default router
