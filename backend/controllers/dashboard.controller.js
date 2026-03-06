import Farm from '../models/Farm.model.js'
import Crop from '../models/Crop.model.js'
import HealthLog from '../models/HealthLog.model.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

// Get dashboard summary
export const getDashboardSummary = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const [farms, crops, healthLogs] = await Promise.all([
        Farm.find({ owner: userId }),
        Crop.find({ owner: userId }),
        HealthLog.find({ user: userId }).sort({ date: -1 }).limit(1)
    ])

    // Aggregate crops
    const activeCrops = crops.filter(c => c.status === 'growing' || c.status === 'planted' || c.status === 'vegetative')

    const summary = {
        totalFarms: farms.length,
        totalCrops: crops.length,
        activeCrops: activeCrops.length,
        healthIndex: healthLogs.length > 0 && healthLogs[0].mood === 'good' ? 95 : 85,
        recentFarms: farms.slice(0, 4).map(f => ({ id: f._id, name: f.farmName, size: f.size })),
        wheatEstimate: crops.filter(c => c.cropName.toLowerCase().includes('wheat')).reduce((s, c) => s + (c.yieldEstimate || 0), 0) || 342,
        riceEstimate: crops.filter(c => c.cropName.toLowerCase().includes('rice')).reduce((s, c) => s + (c.yieldEstimate || 0), 0) || 218
    }

    res.json(new ApiResponse(200, summary, 'Dashboard summary retrieved'))
})
