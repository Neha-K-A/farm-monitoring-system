import WaterUsage from '../models/WaterUsage.model.js'
import Farm from '../models/Farm.model.js'
import Crop from '../models/Crop.model.js'
import Notification from '../models/Notification.model.js'
import { calculateWaterEfficiency } from '../utils/calculations.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

// Log water usage
export const logWaterUsage = asyncHandler(async (req, res) => {
  const { farm, crop, date, waterUsed, irrigationMethod, duration, source, notes } = req.body
  
  if (!farm || !waterUsed) throw new ApiError(400, 'Farm and waterUsed are required')

  const farmDoc = await Farm.findById(farm)
  if (!farmDoc || farmDoc.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  const log = await WaterUsage.create({
    farm,
    crop: crop || null,
    date: date || new Date(),
    waterUsed,
    irrigationMethod,
    duration,
    source,
    notes
  })

  res.status(201).json(new ApiResponse(201, log, 'Water usage logged'))
})

// Get water logs for farm
export const getWaterLogs = asyncHandler(async (req, res) => {
  const farm = await Farm.findById(req.params.farmId)
  if (!farm || farm.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  const logs = await WaterUsage.find({ farm: req.params.farmId }).sort({ date: -1 })
  res.json(new ApiResponse(200, logs, 'Water logs retrieved'))
})

// Get water stats for farm
export const getWaterStats = asyncHandler(async (req, res) => {
  const farm = await Farm.findById(req.params.farmId)
  if (!farm || farm.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  const logs = await WaterUsage.find({ farm: req.params.farmId })
  const totalWater = logs.reduce((sum, log) => sum + log.waterUsed, 0)
  const avgDaily = logs.length > 0 ? (totalWater / logs.length).toFixed(2) : 0
  const efficiency = calculateWaterEfficiency(farm.totalArea, totalWater)

  res.json(new ApiResponse(200, {
    totalWater,
    averageDailyUsage: avgDaily,
    efficiency,
    logsCount: logs.length
  }, 'Water stats retrieved'))
})

// Set monthly water target
export const setWaterTarget = asyncHandler(async (req, res) => {
  const { monthlyTarget } = req.body
  if (!monthlyTarget) throw new ApiError(400, 'Monthly target is required')

  const farm = await Farm.findByIdAndUpdate(
    req.params.farmId,
    { monthlyWaterTarget: monthlyTarget },
    { new: true }
  )
  res.json(new ApiResponse(200, farm, 'Water target set'))
})
