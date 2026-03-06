import { validationResult } from 'express-validator'
import ApiError from '../utils/ApiError.js'

export const validateRequest = (schema) => {
  return (req, res, next) => {
    // Using express-validator
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(e => `${e.param}: ${e.msg}`)
      throw new ApiError(400, 'Validation failed', errorMessages)
    }
    next()
  }
}

export const validateWithZod = (schema) => {
  return (req, res, next) => {
    try {
      // Validate body with Zod schema
      const parsed = schema.parse(req.body)
      req.validatedData = parsed
      next()
    } catch (error) {
      const errors = error.errors?.map(e => `${e.path.join('.')}: ${e.message}`) || [error.message]
      throw new ApiError(400, 'Validation failed', errors)
    }
  }
}
