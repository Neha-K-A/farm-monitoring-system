import bcryptjs from 'bcryptjs'
import User from '../models/User.model.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'
import { uploadToCloudinary } from '../config/cloudinary.js'

// Get user profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -refreshToken')
  if (!user) {
    throw new ApiError(404, 'User not found')
  }
  res.json(new ApiResponse(200, user, 'Profile retrieved'))
})

// Update user profile (name, phone, email, language, location, etc)
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, email, language, location, healthProfile, farmPreferences, notifications, aiPreferences } = req.body
  const updateData = {}

  if (name) updateData.name = name
  if (phone) updateData.phone = phone
  if (email) updateData.email = email
  if (language) updateData.language = language
  if (location) updateData.location = { ...req.user.location, ...location }
  if (healthProfile) {
    updateData.healthProfile = {
      ...(req.user.healthProfile || {}),
      ...healthProfile
    }
  }
  if (farmPreferences) {
    updateData.farmPreferences = {
      ...(req.user.farmPreferences || {}),
      ...farmPreferences
    }
  }
  if (notifications) {
    updateData.notifications = {
      ...(req.user.notifications || {}),
      ...notifications
    }
  }
  if (aiPreferences) {
    updateData.aiPreferences = {
      ...(req.user.aiPreferences || {}),
      ...aiPreferences
    }
  }

  const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-password -refreshToken')
  res.json(new ApiResponse(200, user, 'Profile updated'))
})

// Update health profile (age, weight, height, blood group, chronic conditions)
export const updateHealthProfile = asyncHandler(async (req, res) => {
  const { age, weight, height, bloodGroup, hasChronicCondition, notes } = req.body

  const healthProfile = {
    ...(req.user.healthProfile || {}),
    age,
    weight,
    height,
    bloodGroup,
    hasChronicCondition,
    notes
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { healthProfile },
    { new: true }
  ).select('-password -refreshToken')

  res.json(new ApiResponse(200, user, 'Health profile updated'))
})

// Upload profile photo
export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded')
  }

  const cloudinaryRes = await uploadToCloudinary(req.file.buffer, 'farm-monitoring/profiles')

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profilePhoto: cloudinaryRes.secure_url },
    { new: true }
  ).select('-password -refreshToken')

  res.json(new ApiResponse(200, { profilePhoto: cloudinaryRes.secure_url, user }, 'Profile photo updated'))
})

// Get women farmer success stories
export const getWomenJournal = asyncHandler(async (req, res) => {
  const journal = [
    {
      id: 1,
      name: 'Sunita Devi',
      state: 'Bihar',
      crop: 'Vegetables',
      achievement: 'Tripled family income through organic farming collective',
      story: 'Started with 0.5 acres, now leads a 200-farmer women SHG (Self Help Group) producing certified organic vegetables.',
      year: 2019
    },
    {
      id: 2,
      name: 'Revathi Amma',
      state: 'Kerala',
      crop: 'Banana, Coconut',
      achievement: 'Won National Horticulture Award 2021',
      story: 'Pioneered zero-budget natural farming using cow dung, neem, and local microbes instead of chemical inputs.',
      year: 2021
    },
    {
      id: 3,
      name: 'Kamla Bai',
      state: 'Madhya Pradesh',
      crop: 'Wheat, Soybean',
      achievement: 'First woman farmer in district to use drone spraying',
      story: 'Trained 50 women in digital farming tools and precision agriculture, reducing pesticide use by 40%.',
      year: 2022
    },
    {
      id: 4,
      name: 'Lakshmi Nair',
      state: 'Karnataka',
      crop: 'Paddy, Arecanut',
      achievement: 'Organic certification and direct export to Gulf countries',
      story: 'Built women-only farmer producer organization with 300 members, achieving 200% premium over market price.',
      year: 2020
    },
    {
      id: 5,
      name: 'Parvati Devi',
      state: 'Uttarakhand',
      crop: 'Turmeric, Ginger',
      achievement: 'State Best Farmer Award 2023',
      story: 'Revived traditional hill farming methods with modern marketing, creating value-added products.',
      year: 2023
    },
    {
      id: 6,
      name: 'Meena Kumari',
      state: 'Rajasthan',
      crop: 'Bajra, Cluster Bean',
      achievement: 'Developed drought-resistant crop rotation model',
      story: 'Maintained profitable farming through 3 consecutive drought years using water harvesting.',
      year: 2022
    },
    {
      id: 7,
      name: 'Gita Mahato',
      state: 'Jharkhand',
      crop: 'Rice, Maize',
      achievement: 'NABARD Best Women Farmer 2022',
      story: 'Converted 2 hectares of degraded land into productive farm using SRI (System of Rice Intensification).',
      year: 2022
    },
    {
      id: 8,
      name: 'Vimla Patel',
      state: 'Gujarat',
      crop: 'Cotton, Groundnut',
      achievement: 'Income increased 4x using drip irrigation',
      story: 'Pioneered micro-irrigation in her district, now trains 100+ women farmers annually.',
      year: 2021
    }
  ]
  res.json(new ApiResponse(200, journal, 'Women farmer journal retrieved'))
})

// Get women-friendly tools
export const getWomenFriendlyTools = asyncHandler(async (req, res) => {
  const tools = [
    {
      id: 1,
      name: 'Ergonomic Hand Weeder',
      description: 'Long-handled weeder with padded grip to reduce bending',
      price: '₹200–500',
      benefit: 'Reduces back and knee strain by 60%'
    },
    {
      id: 2,
      name: 'Lightweight 5L Knapsack Sprayer',
      description: 'Foam-padded shoulder strap, easy pump action',
      price: '₹800–1200',
      benefit: 'Reduces shoulder fatigue during spraying'
    },
    {
      id: 3,
      name: 'Padded Knee Guards',
      description: 'EVA foam knee protection for kneeling work',
      price: '₹150–300',
      benefit: 'Protects knees during planting/weeding'
    },
    {
      id: 4,
      name: 'UV-Protective Farming Suit',
      description: 'Lightweight full-body sun protection',
      price: '₹400–800',
      benefit: 'Blocks 90% UV rays, reduces heat stress'
    },
    {
      id: 5,
      name: 'Rubber-Grip Sickle',
      description: 'Ergonomic anti-slip handle',
      price: '₹80–150',
      benefit: 'Reduces hand fatigue and slip risk'
    },
    {
      id: 6,
      name: 'Seed Dibbler / Jab Planter',
      description: 'Standing seed planter (no bending)',
      price: '₹300–600',
      benefit: 'Eliminates bending injury'
    },
    {
      id: 7,
      name: 'Portable Solar Headlamp',
      description: 'Rechargeable via solar, 8-hour battery',
      price: '₹250–500',
      benefit: 'Enables safe early-morning work'
    },
    {
      id: 8,
      name: 'Drip Tape Laying Wheel',
      description: 'Roll-out tool for drip tape installation',
      price: '₹500–900',
      benefit: 'Reduces labour time by 70%'
    }
  ]
  res.json(new ApiResponse(200, tools, 'Women-friendly tools retrieved'))
})

// Delete account
export const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body
  if (!password) {
    throw new ApiError(400, 'Password required to delete account')
  }

  const user = await User.findById(req.user._id).select('+password')
  const isValid = await bcryptjs.compare(password, user.password)
  if (!isValid) {
    throw new ApiError(401, 'Invalid password')
  }

  await User.findByIdAndDelete(req.user._id)
  res.json(new ApiResponse(200, {}, 'Account deleted successfully'))
})
