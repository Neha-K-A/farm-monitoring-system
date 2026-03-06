import SoilRecord from '../models/SoilRecord.model.js'
import Farm from '../models/Farm.model.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

// Generate soil recommendations based on test results
const generateRecommendations = (soil) => {
  const recommendations = []
  if (soil.pH < 5.5) recommendations.push('Soil is acidic. Add lime (CaCO3) at 2-3 tons/hectare')
  if (soil.pH > 8.5) recommendations.push('Soil is alkaline. Add sulfur at 0.5-1 ton/hectare')
  if (soil.nitrogen < 200) recommendations.push('Nitrogen is deficient. Apply urea at 50-100 kg/hectare')
  if (soil.phosphorus < 20) recommendations.push('Phosphorus is deficient. Apply DAP at 50 kg/hectare')
  if (soil.potassium < 150) recommendations.push('Potassium is deficient. Apply MoP at 50 kg/hectare')
  if (soil.organicMatter < 2) recommendations.push('Low organic matter. Add compost/manure at 20-25 tons/hectare')
  if (soil.moisture < 15) recommendations.push('Soil moisture is low. Increase irrigation frequency')
  if (soil.moisture > 30) recommendations.push('Soil is waterlogged. Improve drainage')
  return recommendations
}

// Add soil test record
export const addSoilRecord = asyncHandler(async (req, res) => {
  const { testDate, pH, nitrogen, phosphorus, potassium, organicMatter, moisture, texture, labReportUrl } = req.body
  
  if (!req.params.farmId || !pH) throw new ApiError(400, 'Farm and pH are required')

  const farm = await Farm.findById(req.params.farmId)
  if (!farm || farm.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  const recommendations = generateRecommendations({ pH, nitrogen, phosphorus, potassium, organicMatter, moisture })

  const soilRecord = await SoilRecord.create({
    farm: req.params.farmId,
    testDate: testDate || new Date(),
    pH,
    nitrogen,
    phosphorus,
    potassium,
    organicMatter,
    moisture,
    texture,
    labReportUrl,
    recommendations
  })

  res.status(201).json(new ApiResponse(201, soilRecord, 'Soil record created with recommendations'))
})

// Get soil records for a farm
export const getSoilRecords = asyncHandler(async (req, res) => {
  const farm = await Farm.findById(req.params.farmId)
  if (!farm || farm.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  const soilRecords = await SoilRecord.find({ farm: req.params.farmId }).sort({ testDate: -1 })
  res.json(new ApiResponse(200, soilRecords, 'Soil records retrieved'))
})

// Get latest soil test
export const getLatestSoilTest = asyncHandler(async (req, res) => {
  const farm = await Farm.findById(req.params.farmId)
  if (!farm || farm.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  const latestTest = await SoilRecord.findOne({ farm: req.params.farmId }).sort({ testDate: -1 })
  if (!latestTest) throw new ApiError(404, 'No soil tests found')
  res.json(new ApiResponse(200, latestTest, 'Latest soil test retrieved'))
})
