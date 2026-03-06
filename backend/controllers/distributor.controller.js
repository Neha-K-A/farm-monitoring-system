import Distributor from '../models/Distributor.model.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

// Get all distributors
export const getDistributors = asyncHandler(async (req, res) => {
  const { commodity, state, district } = req.query
  const filter = { isVerified: true }
  if (commodity) filter.commodities = { $in: [commodity] }
  if (state) filter['location.state'] = state
  if (district) filter['location.district'] = district

  const distributors = await Distributor.find(filter)
    .sort({ rating: -1 })
  res.json(new ApiResponse(200, distributors, 'Distributors retrieved'))
})

// Get nearby distributors
export const getNearbyDistributors = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 50 } = req.query
  if (!lat || !lng) throw new ApiError(400, 'Latitude and longitude required')

  const distributors = await Distributor.find({
    'location.coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: radius * 1000
      }
    }
  }).limit(20)

  res.json(new ApiResponse(200, distributors, 'Nearby distributors retrieved'))
})

// Get distributor details
export const getDistributorById = asyncHandler(async (req, res) => {
  const distributor = await Distributor.findById(req.params.id)
  if (!distributor) throw new ApiError(404, 'Distributor not found')
  res.json(new ApiResponse(200, distributor, 'Distributor retrieved'))
})
