import MarketListing from '../models/MarketListing.model.js'
import Notification from '../models/Notification.model.js'
import { uploadToCloudinary } from '../config/cloudinary.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

// Create marketplace listing
export const createListing = asyncHandler(async (req, res) => {
  const { productName, category, quantity, unit, pricePerUnit, moq, availableFrom, isOrganic, certifications } = req.body
  
  if (!productName || !category || !quantity || !pricePerUnit) {
    throw new ApiError(400, 'productName, category, quantity, and pricePerUnit are required')
  }

  const photos = []
  if (req.file) {
    const upload = await uploadToCloudinary(req.file.buffer, 'farm-monitoring/market')
    photos.push(upload.secure_url)
  }

  const listing = await MarketListing.create({
    seller: req.user._id,
    productName,
    category,
    quantity,
    unit,
    pricePerUnit,
    moq: moq || 1,
    availableFrom: availableFrom || new Date(),
    isOrganic: isOrganic || false,
    certifications: certifications || [],
    photos,
    status: 'available'
  })

  res.status(201).json(new ApiResponse(201, listing, 'Listing created'))
})

// Get all listings (public)
export const getListings = asyncHandler(async (req, res) => {
  const { category, status, minPrice, maxPrice } = req.query
  const filter = { status: 'available' }
  if (category) filter.category = category
  if (minPrice || maxPrice) {
    filter.pricePerUnit = {}
    if (minPrice) filter.pricePerUnit.$gte = minPrice
    if (maxPrice) filter.pricePerUnit.$lte = maxPrice
  }

  const listings = await MarketListing.find(filter)
    .populate('seller', 'name phone')
    .sort({ createdAt: -1 })
  res.json(new ApiResponse(200, listings, 'Listings retrieved'))
})

// Get user's listings
export const getMyListings = asyncHandler(async (req, res) => {
  const listings = await MarketListing.find({ seller: req.user._id })
    .sort({ createdAt: -1 })
  res.json(new ApiResponse(200, listings, 'My listings retrieved'))
})

// Get single listing
export const getListingById = asyncHandler(async (req, res) => {
  const listing = await MarketListing.findById(req.params.id)
    .populate('seller', 'name phone email')
  if (!listing) throw new ApiError(404, 'Listing not found')
  res.json(new ApiResponse(200, listing, 'Listing retrieved'))
})

// Update listing
export const updateListing = asyncHandler(async (req, res) => {
  const listing = await MarketListing.findById(req.params.id)
  if (!listing) throw new ApiError(404, 'Listing not found')
  if (listing.seller.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  const { productName, quantity, pricePerUnit, status } = req.body
  if (productName) listing.productName = productName
  if (quantity) listing.quantity = quantity
  if (pricePerUnit) listing.pricePerUnit = pricePerUnit
  if (status) listing.status = status

  await listing.save()
  res.json(new ApiResponse(200, listing, 'Listing updated'))
})

// Delete listing
export const deleteListing = asyncHandler(async (req, res) => {
  const listing = await MarketListing.findById(req.params.id)
  if (!listing) throw new ApiError(404, 'Listing not found')
  if (listing.seller.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  await MarketListing.findByIdAndDelete(req.params.id)
  res.json(new ApiResponse(200, {}, 'Listing deleted'))
})

// Send inquiry
export const sendInquiry = asyncHandler(async (req, res) => {
  const { quantity, message } = req.body
  if (!quantity) throw new ApiError(400, 'Quantity is required')

  const listing = await MarketListing.findById(req.params.id)
  if (!listing) throw new ApiError(404, 'Listing not found')

  listing.inquiries.push({
    buyer: req.user._id,
    quantity,
    message,
    createdAt: new Date()
  })

  await listing.save()

  // Notify seller
  await Notification.create({
    recipient: listing.seller,
    title: 'New Inquiry',
    message: `${req.user.name || 'A buyer'} inquired about ${listing.productName} - ${quantity} ${listing.unit}`,
    type: 'general',
    relatedResource: { resourceType: 'MarketListing', resourceId: listing._id }
  })

  res.status(201).json(new ApiResponse(201, listing, 'Inquiry sent'))
})
