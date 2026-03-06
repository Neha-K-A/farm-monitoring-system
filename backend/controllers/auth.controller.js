import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import User from '../models/User.model.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

const generateAccessToken = (userId) => {
  return jwt.sign(
    { _id: userId },
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { _id: userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
}

export const registerFarmer = asyncHandler(async (req, res) => {
  const { name, phone, email, password, language = 'en', location } = req.body

  if (!name || !phone || !password) {
    throw new ApiError(400, 'Name, phone, and password are required')
  }

  const existingUser = await User.findOne({ phone })
  if (existingUser) {
    throw new ApiError(409, 'Phone number already registered')
  }

  const hashedPassword = await bcryptjs.hash(password, 12)
  
  const user = await User.create({
    name,
    phone,
    email,
    password: hashedPassword,
    language,
    location,
    role: 'farmer'
  })

  const accessToken = generateAccessToken(user._id)
  const refreshToken = generateRefreshToken(user._id)

  user.refreshToken = refreshToken
  await user.save()

  const userResponse = user.toObject()
  delete userResponse.password
  delete userResponse.refreshToken

  res.status(201).json(
    new ApiResponse(201, { user: userResponse, accessToken, refreshToken }, 'Registration successful')
  )
})

export const loginFarmer = asyncHandler(async (req, res) => {
  const { phone, email, password } = req.body

  if (!password || (!phone && !email)) {
    throw new ApiError(400, 'Phone/email and password are required')
  }

  const user = await User.findOne({
    $or: [{ phone }, { email }]
  }).select('+password +refreshToken')

  if (!user) {
    throw new ApiError(401, 'Invalid credentials')
  }

  const isPasswordValid = await bcryptjs.compare(password, user.password)
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials')
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated')
  }

  const accessToken = generateAccessToken(user._id)
  const refreshToken = generateRefreshToken(user._id)

  user.refreshToken = refreshToken
  await user.save()

  const userResponse = user.toObject()
  delete userResponse.password
  delete userResponse.refreshToken

  res.json(
    new ApiResponse(200, { user: userResponse, accessToken, refreshToken }, 'Login successful')
  )
})

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken

  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token required')
  }

  const decoded = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
  )

  const user = await User.findById(decoded._id).select('+refreshToken')

  if (!user || user.refreshToken !== refreshToken) {
    throw new ApiError(401, 'Invalid refresh token')
  }

  const accessToken = generateAccessToken(user._id)

  res.json(
    new ApiResponse(200, { accessToken }, 'Token refreshed')
  )
})

export const logoutFarmer = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null })

  res.json(
    new ApiResponse(200, {}, 'Logged out successfully')
  )
})

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.json(
    new ApiResponse(200, req.user, 'User retrieved')
  )
})
