import DetectionLog from '../models/DetectionLog.model.js'
import Crop from '../models/Crop.model.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'
import fs from 'fs'
import path from 'path'

// Mock Data for Phase 9: Image Based Plant Diagnosis
const mockDiagnoses = [
  {
    detectedClass: 'Early Blight',
    confidence: 0.94,
    condition: 'Diseased',
    treatmentSuggested: 'Apply copper-based fungicide to infected areas. Remove infected lower leaves promptly.',
    prevention: 'Ensure proper spacing for air circulation. Avoid overhead watering to keep foliage dry.'
  },
  {
    detectedClass: 'Healthy',
    confidence: 0.98,
    condition: 'Healthy',
    treatmentSuggested: 'None required.',
    prevention: 'Maintain current nutrient and watering schedule. Continue regular scouting.'
  },
  {
    detectedClass: 'Powdery Mildew',
    confidence: 0.88,
    condition: 'Diseased',
    treatmentSuggested: 'Apply sulfur or potassium bicarbonate sprays immediately.',
    prevention: 'Plant resistant varieties. Control humidity and improve sunlight penetration.'
  },
  {
    detectedClass: 'Nutrient Deficiency (Nitrogen)',
    confidence: 0.81,
    condition: 'Deficient',
    treatmentSuggested: 'Apply balanced NPK fertilizer or compost tea to boost nitrogen levels.',
    prevention: 'Maintain regular soil testing. Use cover crops like legumes during off-season.'
  }
];

// Detect disease from image (Mocked Ollama/Vision endpoint for Phase 9)
export const detectFromImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Image file required')

  const sessionId = Date.now().toString()

  // Clean up the uploaded file to save space since we are returning mock
  const uploadsDir = path.join(process.cwd(), 'uploads')
  const tempPath = path.join(uploadsDir, `detect_${sessionId}.jpg`)
  if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath)

  try {
    const { farm, crop } = req.body

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Select a random mock result
    const mockResult = mockDiagnoses[Math.floor(Math.random() * mockDiagnoses.length)];

    const log = await DetectionLog.create({
      user: req.user._id,
      farm: farm || null,
      sessionId,
      detectedClass: mockResult.detectedClass,
      confidence: mockResult.confidence,
      timestamp: new Date(),
      action: 'image_detection',
      condition: mockResult.condition,
      treatmentSuggested: mockResult.treatmentSuggested,
      prevention: mockResult.prevention,
      cropAffected: crop || null
    })

    if (crop && mockResult.condition !== 'Healthy') {
      const cropDoc = await Crop.findById(crop)
      if (cropDoc && cropDoc.owner.toString() === req.user._id.toString()) {
        cropDoc.diseaseHistory.push({
          diseaseName: mockResult.detectedClass,
          detectedOn: new Date(),
          severity: mockResult.confidence > 0.8 ? 'high' : 'medium',
          treatment: mockResult.treatmentSuggested
        })
        await cropDoc.save()
      }
    }

    res.json(new ApiResponse(200, log, 'Diagnosis complete'))
  } catch (error) {
    throw new ApiError(500, `Diagnosis failed: ${error.message}`)
  }
})

// Get detection results for user
export const getDetectionResults = asyncHandler(async (req, res) => {
  const { sessionId, farm } = req.query
  const filter = { user: req.user._id }
  if (sessionId) filter.sessionId = sessionId
  if (farm) filter.farm = farm

  const results = await DetectionLog.find(filter).sort({ timestamp: -1 }).limit(50)
  res.json(new ApiResponse(200, results, 'Detection results retrieved'))
})

// Get pipeline status
export const getPipelineStatus = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, {
    running: true,
    status: 'ok',
    mode: 'mock_ollama_vision',
    supportedClasses: ['healthy', 'early_blight', 'powdery_mildew', 'nutrient_deficiency']
  }, 'Pipeline status'))
})
