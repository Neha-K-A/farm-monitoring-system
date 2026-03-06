import User from '../models/User.model.js'
import { LANGUAGE_NAMES, SUPPORTED_LANGUAGES } from '../utils/languageHelper.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

// Get supported languages
export const getSupportedLanguages = asyncHandler(async (req, res) => {
  const languages = Object.entries(LANGUAGE_NAMES).map(([code, { name, nativeName }]) => ({
    code,
    name,
    nativeName
  }))
  res.json(new ApiResponse(200, languages, 'Supported languages retrieved'))
})

// Update user language preference
export const updateLanguagePreference = asyncHandler(async (req, res) => {
  const { language } = req.body
  if (!language || !SUPPORTED_LANGUAGES.includes(language)) {
    throw new ApiError(400, 'Invalid language code')
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { language },
    { new: true }
  ).select('-password -refreshToken')

  res.json(new ApiResponse(200, { language: user.language }, 'Language preference updated'))
})

// Translate text (placeholder for Google Translate API)
export const translateText = asyncHandler(async (req, res) => {
  const { text, targetLanguage } = req.query
  if (!text || !targetLanguage) throw new ApiError(400, 'Text and targetLanguage required')
  if (!SUPPORTED_LANGUAGES.includes(targetLanguage)) {
    throw new ApiError(400, 'Invalid target language')
  }

  res.json(new ApiResponse(200, {
    originalText: text,
    translatedText: text,
    targetLanguage
  }, 'Translation retrieved (mock)'))
})
