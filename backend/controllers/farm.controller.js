import Farm from '../models/Farm.model.js'
import Crop from '../models/Crop.model.js'
import SoilRecord from '../models/SoilRecord.model.js'
import WaterUsage from '../models/WaterUsage.model.js'
import HealthLog from '../models/HealthLog.model.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

// Create farm
export const createFarm = asyncHandler(async (req, res) => {
  const { farmName, totalArea, areaUnit, location, irrigationSystem, soilType, waterSource, isOrganic, farmMap } = req.body
  
  if (!totalArea) throw new ApiError(400, 'Total area is required')
  
  const areaUnitNorm = areaUnit && areaUnit.toLowerCase() === 'acre' ? 'acres' : areaUnit
  
  const farm = await Farm.create({
    owner: req.user._id,
    farmName,
    totalArea,
    areaUnit: areaUnitNorm,
    location,
    irrigationSystem,
    soilType,
    waterSource,
    isOrganic: isOrganic || false,
    farmMap
  })

  res.status(201).json(new ApiResponse(201, farm, 'Farm created'))
})

// Get all user farms
export const getFarms = asyncHandler(async (req, res) => {
  const farms = await Farm.find({ owner: req.user._id }).populate('owner', 'name phone')
  res.json(new ApiResponse(200, farms, 'Farms retrieved'))
})

// Get single farm
export const getFarmById = asyncHandler(async (req, res) => {
  const farm = await Farm.findById(req.params.farmId).populate('owner', 'name phone')
  if (!farm) throw new ApiError(404, 'Farm not found')
  if (farm.owner._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized to access this farm')
  }
  res.json(new ApiResponse(200, farm, 'Farm retrieved'))
})

// Update farm
export const updateFarm = asyncHandler(async (req, res) => {
  const { farmName, totalArea, areaUnit, location, irrigationSystem, soilType, waterSource, isOrganic } = req.body
  
  let farm = await Farm.findById(req.params.farmId)
  if (!farm) throw new ApiError(404, 'Farm not found')
  if (farm.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  const updateData = {}
  if (farmName) updateData.farmName = farmName
  if (totalArea) updateData.totalArea = totalArea
  if (areaUnit) updateData.areaUnit = areaUnit.toLowerCase() === 'acre' ? 'acres' : areaUnit
  if (location) updateData.location = { ...farm.location, ...location }
  if (irrigationSystem) updateData.irrigationSystem = irrigationSystem
  if (soilType) updateData.soilType = soilType
  if (waterSource) updateData.waterSource = waterSource
  if (typeof isOrganic !== 'undefined') updateData.isOrganic = isOrganic

  farm = await Farm.findByIdAndUpdate(req.params.farmId, updateData, { new: true })
  res.json(new ApiResponse(200, farm, 'Farm updated'))
})

// Delete farm
export const deleteFarm = asyncHandler(async (req, res) => {
  const farm = await Farm.findById(req.params.farmId)
  if (!farm) throw new ApiError(404, 'Farm not found')
  if (farm.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  await Farm.findByIdAndDelete(req.params.farmId)
  res.json(new ApiResponse(200, {}, 'Farm deleted'))
})

// Get farm summary (crops, soil, water, health stats)
export const getFarmSummary = asyncHandler(async (req, res) => {
  const farm = await Farm.findById(req.params.farmId)
  if (!farm) throw new ApiError(404, 'Farm not found')
  if (farm.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  const [crops, soilRecords, waterLogs, healthLogs] = await Promise.all([
    Crop.find({ farm: req.params.farmId }).select('cropName plantingDate expectedHarvestDate status'),
    SoilRecord.find({ farm: req.params.farmId }).sort({ testDate: -1 }).limit(1),
    WaterUsage.find({ farm: req.params.farmId }).sort({ date: -1 }).limit(30),
    HealthLog.find({ user: req.user._id }).sort({ date: -1 }).limit(30)
  ])

  const summary = {
    farm: { _id: farm._id, farmName: farm.farmName, totalArea: farm.totalArea },
    totalCrops: crops.length,
    activeCrops: crops.filter(c => c.status === 'growing').length,
    harvestDue: crops.filter(c => c.status === 'ready_to_harvest').length,
    lastSoilTest: soilRecords[0] || null,
    waterLogsCount: waterLogs.length,
    healthLogsCount: healthLogs.length
  }

  res.json(new ApiResponse(200, summary, 'Farm summary retrieved'))
})
