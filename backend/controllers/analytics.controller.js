import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

// Get monthly predictions
export const getPredictions = asyncHandler(async (req, res) => {
    // In a real scenario, this would aggregate data from ML models or run predictions based on past yields
    // Here we simulate the ML output for the dashboard charts

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const baseWheat = 70;
    const baseRice = 50;
    const baseMaize = 40;

    const predictions = months.map((month, index) => {
        // Add some realistic variation per month
        const wheat = baseWheat + Math.floor(Math.random() * 20) - 5;
        const rice = baseRice + Math.floor(Math.random() * 25) - 5;
        const maize = baseMaize + Math.floor(Math.random() * 20);

        return {
            month,
            wheat: Math.min(Math.max(wheat, 0), 100),
            rice: Math.min(Math.max(rice, 0), 100),
            maize: Math.min(Math.max(maize, 0), 100)
        }
    })

    res.json(new ApiResponse(200, predictions, 'Predictions retrieved'))
})
