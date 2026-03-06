import Farm from '../models/Farm.model.js'
import SoilRecord from '../models/SoilRecord.model.js'
import { getSeasonalCrops, generateWeatherRecommendation } from '../utils/weatherHelper.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

const cropRecommendationMap = {
  'kharif': ['rice', 'maize', 'cotton', 'sugarcane', 'groundnut'],
  'rabi': ['wheat', 'barley', 'chickpea', 'mustard', 'potato'],
  'zaid': ['watermelon', 'muskmelon', 'cucumber', 'okra', 'moong']
}

const irrigationMap = {
  'drip': { waterSaving: '50-60%', cropSuitability: ['vegetables', 'fruits', 'spices'], cost: 'Medium' },
  'sprinkler': { waterSaving: '30-40%', cropSuitability: ['cereals', 'pulses', 'vegetables'], cost: 'Medium-High' },
  'flood': { waterSaving: '0%', cropSuitability: ['rice', 'sugarcane'], cost: 'Low' },
  'rainfed': { waterSaving: '100%', cropSuitability: ['pulses', 'oilseeds'], cost: 'Very Low' }
}

// Get crop recommendations
export const getCropRecommendations = asyncHandler(async (req, res) => {
  const farm = await Farm.findById(req.params.farmId)
  if (!farm || farm.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  const season = req.query.season || 'kharif'
  const recommendations = cropRecommendationMap[season.toLowerCase()] || cropRecommendationMap['kharif']
  const soilTest = await SoilRecord.findOne({ farm: req.params.farmId }).sort({ testDate: -1 })

  res.json(new ApiResponse(200, {
    season,
    recommendedCrops: recommendations,
    soilCondition: soilTest ? { pH: soilTest.pH, nitrogen: soilTest.nitrogen } : null
  }, 'Crop recommendations retrieved'))
})

// Get irrigation recommendations
export const getIrrigationRecommendations = asyncHandler(async (req, res) => {
  const farm = await Farm.findById(req.params.farmId)
  if (!farm || farm.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  const currentIrrigation = farm.irrigationSystem || 'flood'
  const recommendation = irrigationMap[currentIrrigation] || irrigationMap['flood']

  res.json(new ApiResponse(200, {
    currentSystem: currentIrrigation,
    benefits: recommendation,
    upgradeSuggestion: 'Drip irrigation is ideal for vegetables and fruits'
  }, 'Irrigation recommendations retrieved'))
})

// Get organic farming guide
export const getOrganicFarmingGuide = asyncHandler(async (req, res) => {
  const guide = {
    title: 'Organic Farming Guidelines',
    principles: [
      'Use cow dung, compost, bone meal instead of synthetic fertilizers',
      'Apply neem oil, garlic spray instead of chemical pesticides',
      'Maintain crop rotation (min 3-year cycle)',
      'Use mulching to retain soil moisture',
      'Build soil health with green manuring'
    ],
    compostMaking: 'Layer cow dung, farm waste, leaves. Ferment for 45-60 days. Use 5-10 tons/hectare',
    yields: 'Expect 15-20% lower yields in first 2 years, then 100% of conventional yields',
    certification: 'Apply through IFOAM-affiliated bodies. Cost: ₹10000-20000'
  }
  res.json(new ApiResponse(200, guide, 'Organic farming guide retrieved'))
})

// Get modern farming tech recommendations
export const getModernToolsRecommendations = asyncHandler(async (req, res) => {
  const tools = [
    { name: 'Soil Moisture Sensor', cost: '₹5000-10000', benefit: 'Optimized irrigation, 30% water saving' },
    { name: 'Drone for Crop Monitoring', cost: '₹2-5 lakhs', benefit: 'Real-time pest/disease detection' },
    { name: 'Weather Station', cost: '₹20000-50000', benefit: 'Precise weather forecasts for farm' },
    { name: 'Fertigation Kit', cost: '₹50000-1 lakh', benefit: 'Fertilizer mixed with irrigation water' },
    { name: 'Automatic Drip Timer', cost: '₹2000-5000', benefit: 'Automated irrigation scheduling' }
  ]
  res.json(new ApiResponse(200, tools, 'Modern farming tools retrieved'))
})
