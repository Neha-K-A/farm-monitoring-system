import WeatherLog from '../models/WeatherLog.model.js'
import Farm from '../models/Farm.model.js'
import { generateWeatherRecommendation, getSeasonalCrops } from '../utils/weatherHelper.js'
import axios from 'axios'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

// Fetch current weather for a farm
export const getCurrentWeather = asyncHandler(async (req, res) => {
  const farm = await Farm.findById(req.params.farmId)
  if (!farm || farm.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  // Generate dynamic dummy IoT data replacing real API calls for now
  const baseTemp = 28;
  const tempFluctuation = (Math.random() * 2 - 1).toFixed(1); // -1.0 to 1.0
  const currentTemp = baseTemp + parseFloat(tempFluctuation);

  const weatherData = {
    temperature: currentTemp,
    feelsLike: currentTemp + 2,
    humidity: 60 + Math.floor(Math.random() * 15),
    rainfall: Math.random() < 0.2 ? Math.floor(Math.random() * 10) : 0, // 20% chance of rain
    windSpeed: 10 + Math.floor(Math.random() * 10),
    uvIndex: Math.floor(Math.random() * 10) + 1,
    condition: currentTemp > 28 ? 'Sunny' : 'Partly Cloudy',
    alerts: [],
    plantingRecommendation: generateWeatherRecommendation({ temp: currentTemp, humidity: 65 })
  }

  const alerts = []
  if (weatherData.temperature > 40) alerts.push('High temperature: Consider increasing irrigation')
  if (weatherData.humidity > 85) alerts.push('High humidity: Risk of fungal diseases')
  if (weatherData.temperature < 5) alerts.push('Low temperature: Frost risk')
  weatherData.alerts = alerts

  // Optional: Do not populate DB with thousands of logs during 5s polling
  // to avoid cluttering DB, so we'll skip creating WeatherLog here for the dummy phase

  // Also send forecast
  const forecast = [
    { date: new Date(Date.now() + 86400000), condition: 'Sunny', maxTemp: 32, minTemp: 20, rainChance: 5 },
    { date: new Date(Date.now() + 172800000), condition: 'Cloudy', maxTemp: 27, minTemp: 18, rainChance: 25 }
  ]

  res.json(new ApiResponse(200, { current: weatherData, forecast }, 'Live weather retrieved'))
})

// Get weather history for a farm
export const getWeatherHistory = asyncHandler(async (req, res) => {
  const farm = await Farm.findById(req.params.farmId)
  if (!farm || farm.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  const logs = await WeatherLog.find({ farm: req.params.farmId }).sort({ recordedAt: -1 }).limit(30)
  res.json(new ApiResponse(200, logs, 'Weather history retrieved'))
})

// Get seasonal crop recommendations
export const getSeasonalCropRecommendations = asyncHandler(async (req, res) => {
  const crops = getSeasonalCrops()
  res.json(new ApiResponse(200, crops, 'Seasonal crops recommended'))
})

// Get mock weather for public dashboard
export const getMockWeather = asyncHandler(async (req, res) => {
  const baseTemp = 28;
  const tempFluctuation = (Math.random() * 2 - 1).toFixed(1); // -1.0 to 1.0
  const currentTemp = baseTemp + parseFloat(tempFluctuation);

  const current = {
    temperature: currentTemp,
    feelsLike: currentTemp + 3,
    humidity: 65 + Math.floor(Math.random() * 5 - 2),
    windSpeed: 14 + Math.floor(Math.random() * 4 - 2),
    uvIndex: Math.floor(Math.random() * 2) + 6,
    condition: 'Partly Cloudy',
    plantingRecommendation: 'Ideal temperature for most crops.'
  }

  const forecast = [
    { date: new Date(Date.now() + 86400000), condition: 'Sunny', maxTemp: 32, minTemp: 20, rainChance: 5 },
    { date: new Date(Date.now() + 172800000), condition: 'Cloudy', maxTemp: 27, minTemp: 18, rainChance: 25 },
    { date: new Date(Date.now() + 259200000), condition: 'Rainy', maxTemp: 24, minTemp: 16, rainChance: 80 },
    { date: new Date(Date.now() + 345600000), condition: 'Partly Cloudy', maxTemp: 26, minTemp: 17, rainChance: 30 }
  ]

  res.json(new ApiResponse(200, { current, forecast }, 'Mock weather retrieved'))
})
