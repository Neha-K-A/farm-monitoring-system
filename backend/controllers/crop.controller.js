import Crop from '../models/Crop.model.js'
import Farm from '../models/Farm.model.js'
import { calculateProjectedProfit, calculateProfitMargin, estimateYield } from '../utils/calculations.js'
import { diseaseTreatmentMap } from '../utils/diseaseTreatmentMap.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

// Create crop
export const createCrop = asyncHandler(async (req, res) => {
  const { farm, cropName, cropType, plantingDate, expectedHarvestDate, seedQuantity, status } = req.body
  
  if (!farm || !cropName || !cropType || !plantingDate) {
    throw new ApiError(400, 'Farm, cropName, cropType, and plantingDate are required')
  }

  const farmDoc = await Farm.findById(farm)
  if (!farmDoc || farmDoc.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized or farm not found')
  }

  // Auto-calculate expectedHarvestDate if not provided (default 90-120 days based on crop type)
  let finalHarvestDate = expectedHarvestDate
  if (!finalHarvestDate) {
    const plantDate = new Date(plantingDate)
    const daysToHarvest = cropType === 'vegetable' ? 90 : cropType === 'grain' ? 120 : 100
    finalHarvestDate = new Date(plantDate.getTime() + daysToHarvest * 24 * 60 * 60 * 1000)
  }

  const crop = await Crop.create({
    farm,
    owner: req.user._id,
    cropName,
    cropType,
    plantingDate,
    expectedHarvestDate: finalHarvestDate,
    seedQuantity,
    status: status || 'planted',
    yieldEstimate: estimateYield(cropName),
    inputs: [],
    diseaseHistory: [],
    growthStages: []
  })

  res.status(201).json(new ApiResponse(201, crop, 'Crop created'))
})

// Get all crops for user
export const getCrops = asyncHandler(async (req, res) => {
  const { farm, status } = req.query
  const filter = { owner: req.user._id }
  if (farm) filter.farm = farm
  if (status) filter.status = status

  const crops = await Crop.find(filter).populate('farm', 'farmName').sort({ plantingDate: -1 })
  res.json(new ApiResponse(200, crops, 'Crops retrieved'))
})

// Get single crop
export const getCropById = asyncHandler(async (req, res) => {
  const crop = await Crop.findById(req.params.cropId)
  if (!crop) throw new ApiError(404, 'Crop not found')
  if (crop.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }
  res.json(new ApiResponse(200, crop, 'Crop retrieved'))
})

// Update crop status, dates, or yield info
export const updateCrop = asyncHandler(async (req, res) => {
  const { status, expectedHarvestDate, actualHarvestDate, actualYield, marketPrice, notes } = req.body
  
  const crop = await Crop.findById(req.params.cropId)
  if (!crop) throw new ApiError(404, 'Crop not found')
  if (crop.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  const updateData = {}
  if (status) updateData.status = status
  if (expectedHarvestDate) updateData.expectedHarvestDate = expectedHarvestDate
  if (actualHarvestDate) updateData.actualHarvestDate = actualHarvestDate
  if (actualYield) updateData.actualYield = actualYield
  if (marketPrice) updateData.marketPrice = marketPrice
  if (notes) updateData.notes = notes

  const updated = await Crop.findByIdAndUpdate(req.params.cropId, updateData, { new: true })
  res.json(new ApiResponse(200, updated, 'Crop updated'))
})

// Delete crop
export const deleteCrop = asyncHandler(async (req, res) => {
  const crop = await Crop.findById(req.params.cropId)
  if (!crop) throw new ApiError(404, 'Crop not found')
  if (crop.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  await Crop.findByIdAndDelete(req.params.cropId)
  res.json(new ApiResponse(200, {}, 'Crop deleted'))
})

// Add crop input (fertilizer, pesticide, seed, etc.)
export const addInput = asyncHandler(async (req, res) => {
  const { type, name, quantity, unit, costPerUnit, dateApplied } = req.body
  
  if (!type || !name || !quantity) {
    throw new ApiError(400, 'Type, name, and quantity are required')
  }

  const crop = await Crop.findById(req.params.cropId)
  if (!crop) throw new ApiError(404, 'Crop not found')
  if (crop.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  const totalCost = (costPerUnit || 0) * quantity
  crop.inputs.push({
    type,
    name,
    quantity,
    unit,
    costPerUnit: costPerUnit || 0,
    totalCost,
    dateApplied: dateApplied || new Date()
  })

  await crop.save()
  res.status(201).json(new ApiResponse(201, crop, 'Input added'))
})

// Log disease detection
export const addDisease = asyncHandler(async (req, res) => {
  const { diseaseName, detectedOn, severity, photoUrl } = req.body
  
  if (!diseaseName || !severity) {
    throw new ApiError(400, 'Disease name and severity are required')
  }

  const crop = await Crop.findById(req.params.cropId)
  if (!crop) throw new ApiError(404, 'Crop not found')
  if (crop.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  const treatment = diseaseTreatmentMap[diseaseName.toLowerCase()] || 'Consult agricultural extension officer'

  crop.diseaseHistory.push({
    diseaseName,
    detectedOn: detectedOn || new Date(),
    severity,
    treatment,
    photoUrl
  })

  await crop.save()
  res.status(201).json(new ApiResponse(201, crop, 'Disease logged, treatment provided'))
})

// Add growth stage
export const addGrowthStage = asyncHandler(async (req, res) => {
  const { stageName, endDate, notes, photoUrl } = req.body
  
  if (!stageName) throw new ApiError(400, 'Stage name is required')

  const crop = await Crop.findById(req.params.cropId)
  if (!crop) throw new ApiError(404, 'Crop not found')
  if (crop.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  crop.growthStages.push({
    stageName,
    startDate: new Date(),
    endDate,
    notes,
    photoUrl
  })

  await crop.save()
  res.status(201).json(new ApiResponse(201, crop, 'Growth stage added'))
})

// Get crops due for harvest
export const getDueYields = asyncHandler(async (req, res) => {
  const now = new Date()
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const [due7, due14, due30] = await Promise.all([
    Crop.find({
      owner: req.user._id,
      status: { $in: ['growing', 'ready_to_harvest'] },
      expectedHarvestDate: { $lte: in7Days, $gte: now }
    }).select('cropName expectedHarvestDate farm'),
    Crop.find({
      owner: req.user._id,
      status: { $in: ['growing', 'ready_to_harvest'] },
      expectedHarvestDate: { $lte: in14Days, $gt: in7Days }
    }).select('cropName expectedHarvestDate farm'),
    Crop.find({
      owner: req.user._id,
      status: { $in: ['growing', 'ready_to_harvest'] },
      expectedHarvestDate: { $lte: in30Days, $gt: in14Days }
    }).select('cropName expectedHarvestDate farm')
  ])

  res.json(new ApiResponse(200, {
    within7Days: due7,
    within14Days: due14,
    within30Days: due30
  }, 'Due yields retrieved'))
})

// Calculate crop profit
export const calculateProfit = asyncHandler(async (req, res) => {
  const crop = await Crop.findById(req.params.cropId)
  if (!crop) throw new ApiError(404, 'Crop not found')
  if (crop.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  const totalInputCost = crop.inputs.reduce((sum, input) => sum + (input.totalCost || 0), 0)
  const totalRevenue = (crop.actualYield || crop.yieldEstimate || 0) * (crop.marketPrice || 0)
  const profit = totalRevenue - totalInputCost

  const profitData = {
    cropName: crop.cropName,
    totalInputCost,
    totalRevenue,
    grossProfit: profit,
    profitMargin: totalRevenue ? ((profit / totalRevenue) * 100).toFixed(2) : 0,
    inputsCount: crop.inputs.length,
    estimatedYield: crop.yieldEstimate,
    actualYield: crop.actualYield,
    marketPrice: crop.marketPrice
  }

  res.json(new ApiResponse(200, profitData, 'Profit calculated'))
})
