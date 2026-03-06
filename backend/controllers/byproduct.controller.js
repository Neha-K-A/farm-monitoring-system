import ByProduct from '../models/ByProduct.model.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

// By-product suggestions map
const byProductSuggestions = {
  wheat: [
    { name: 'Wheat Straw', uses: ['Animal feed', 'Bedding', 'Mulch', 'Biofuel'], value: '₹2-3/kg' },
    { name: 'Wheat Bran', uses: ['Animal feed', 'Biogas input'], value: '₹1-2/kg' }
  ],
  rice: [
    { name: 'Rice Straw', uses: ['Animal feed', 'Composting', 'Mulch'], value: '₹1-2/kg' },
    { name: 'Rice Husk', uses: ['Biofuel', 'Packaging', 'Insulation'], value: '₹2-4/kg' },
    { name: 'Rice Bran', uses: ['Animal feed', 'Oil extraction'], value: '₹3-5/kg' }
  ],
  sugarcane: [
    { name: 'Bagasse', uses: ['Biofuel', 'Paper pulp', 'Composting'], value: '₹1-2/kg' },
    { name: 'Molasses', uses: ['Alcohol production', 'Animal feed'], value: '₹5-8/kg' }
  ],
  cotton: [
    { name: 'Cotton Stalk', uses: ['Firewood', 'Composting', 'Animal feed'], value: '₹0.5-1/kg' },
    { name: 'Cotton Seed', uses: ['Oil pressing', 'Animal feed'], value: '₹10-15/kg' }
  ],
  maize: [
    { name: 'Maize Stover', uses: ['Animal feed', 'Mulch', 'Biofuel'], value: '₹1.5-2.5/kg' },
    { name: 'Corn Cob', uses: ['Animal bedding', 'Biofuel'], value: '₹3-5/kg' }
  ]
}

// Create by-product listing
export const createByProduct = asyncHandler(async (req, res) => {
  const { sourceCrop, byProductName, quantity, unit, pricePerUnit, description, photos } = req.body
  
  if (!sourceCrop || !byProductName || !quantity) {
    throw new ApiError(400, 'Source crop, product name, and quantity are required')
  }

  const byProduct = await ByProduct.create({
    owner: req.user._id,
    sourceCrop,
    byProductName,
    description,
    quantity,
    unit: unit || 'kg',
    pricePerUnit: pricePerUnit || 0,
    photos: photos || [],
    status: 'available'
  })

  res.status(201).json(new ApiResponse(201, byProduct, 'By-product created'))
})

// Get all by-products
export const getByProducts = asyncHandler(async (req, res) => {
  const { status, sourceCrop } = req.query
  const filter = { status: 'available' }
  if (sourceCrop) filter.sourceCrop = sourceCrop

  const byProducts = await ByProduct.find(filter)
    .populate('owner', 'name phone')
    .sort({ createdAt: -1 })
  res.json(new ApiResponse(200, byProducts, 'By-products retrieved'))
})

// Get by-product suggestions
export const getByProductSuggestions = asyncHandler(async (req, res) => {
  const { crop } = req.query
  
  if (crop) {
    const suggestions = byProductSuggestions[crop.toLowerCase()]
    if (!suggestions) throw new ApiError(404, `No suggestions for crop: ${crop}`)
    res.json(new ApiResponse(200, { [crop]: suggestions }, 'Suggestions retrieved'))
  } else {
    res.json(new ApiResponse(200, byProductSuggestions, 'All suggestions retrieved'))
  }
})

// Update by-product
export const updateByProduct = asyncHandler(async (req, res) => {
  const byProduct = await ByProduct.findById(req.params.id)
  if (!byProduct) throw new ApiError(404, 'By-product not found')
  if (byProduct.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  const { quantity, pricePerUnit, status } = req.body
  if (quantity) byProduct.quantity = quantity
  if (pricePerUnit) byProduct.pricePerUnit = pricePerUnit
  if (status) byProduct.status = status

  await byProduct.save()
  res.json(new ApiResponse(200, byProduct, 'By-product updated'))
})

// Delete by-product
export const deleteByProduct = asyncHandler(async (req, res) => {
  const byProduct = await ByProduct.findById(req.params.id)
  if (!byProduct) throw new ApiError(404, 'By-product not found')
  if (byProduct.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized')
  }

  await ByProduct.findByIdAndDelete(req.params.id)
  res.json(new ApiResponse(200, {}, 'By-product deleted'))
})
