import GovScheme from '../models/GovScheme.model.js'
import User from '../models/User.model.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

// Get all schemes
export const getAllSchemes = asyncHandler(async (req, res) => {
  const { category, state, isActive } = req.query
  const filter = {}
  if (category) filter.category = category
  if (state && state !== 'all') filter.state = state
  if (isActive !== undefined) filter.isActive = isActive === 'true'

  const schemes = await GovScheme.find(filter).sort({ createdAt: -1 })
  res.json(new ApiResponse(200, schemes, 'Schemes retrieved'))
})

// Get relevant schemes for user
export const getRelevantSchemes = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  const userState = user.location?.state || 'all'

  const schemes = await GovScheme.find({
    isActive: true,
    $or: [
      { state: userState },
      { state: 'all' }
    ]
  }).sort({ createdAt: -1 })

  res.json(new ApiResponse(200, schemes, 'Relevant schemes retrieved'))
})

// Get single scheme
export const getSchemeById = asyncHandler(async (req, res) => {
  const scheme = await GovScheme.findById(req.params.id)
  if (!scheme) throw new ApiError(404, 'Scheme not found')
  res.json(new ApiResponse(200, scheme, 'Scheme retrieved'))
})

// Seed schemes (admin only)
export const seedSchemes = asyncHandler(async (req, res) => {
  const existingCount = await GovScheme.countDocuments()
  if (existingCount > 0) {
    return res.json(new ApiResponse(200, { message: 'Schemes already seeded' }, 'Schemes found'))
  }

  const schemes = [
    {
      name: 'PM-KISAN',
      schemeName: 'PM-KISAN',
      description: 'Direct income support of ₹6000/year in 3 instalments for farmer families.',
      eligibility: ['All farmers', 'Landholding up to 2 hectares'],
      benefits: '₹6000 per year in 3 equal instalments',
      subsidyAmount: 6000,
      officialLink: 'https://pmkisan.gov.in/',
      category: 'subsidy',
      isActive: true
    },
    {
      name: 'PM Fasal Bima Yojana',
      schemeName: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      description: 'Crop insurance providing full coverage against crop failure.',
      eligibility: ['All farmers', 'Those affected by natural calamities'],
      benefits: 'Full financial coverage against crop losses',
      subsidyAmount: 0,
      officialLink: 'https://pmfby.gov.in/',
      category: 'insurance',
      isActive: true
    },
    {
      name: 'Kisan Credit Card',
      schemeName: 'Kisan Credit Card (KCC)',
      description: 'Easy agricultural credit at low interest rates to meet cultivation needs.',
      eligibility: ['Farmers with landholding', 'Bank account holders'],
      benefits: 'Credit limit up to ₹10 lakh with 7% interest rate',
      subsidyAmount: 0,
      officialLink: 'https://www.myscheme.gov.in/schemes/kcc',
      category: 'loan',
      isActive: true
    },
    {
      name: 'PM Krishi Sinchai Yojana',
      schemeName: 'PM Krishi Sinchayee Yojana',
      description: 'Irrigation scheme with subsidy on water management tech (drip and sprinkler).',
      eligibility: ['Farmers with water sources', 'Command area villages'],
      benefits: 'Drip irrigation subsidy 50-80%',
      subsidyAmount: 50000,
      officialLink: 'https://pmksy.gov.in/',
      category: 'equipment',
      isActive: true
    },
    {
      name: 'Soil Health Card',
      schemeName: 'Soil Health Card Scheme',
      description: 'Free soil testing and targeted nutrient management advice for optimizing yield.',
      eligibility: ['All farmers across states'],
      benefits: 'Free soil test report and personalized fertilizer recommendations',
      subsidyAmount: 0,
      officialLink: 'https://soilhealth.dac.gov.in/',
      category: 'training',
      isActive: true
    }
  ]

  await GovScheme.insertMany(schemes)
  res.status(201).json(new ApiResponse(201, { count: schemes.length }, 'Schemes seeded successfully'))
})
