import jwt from 'jsonwebtoken'
import User from '../models/User.model.js'
import ApiError from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.accessToken
  
  if (!token) {
    throw new ApiError(401, 'Access token required')
  }

  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET)
  const user = await User.findById(decoded._id).select('-password -refreshToken')
  
  if (!user) {
    throw new ApiError(401, 'Invalid token - user not found')
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated')
  }

  req.user = user
  next()
})
