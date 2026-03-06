import mongoose from 'mongoose'

const marketListingSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop'
    },
    productName: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['vegetable', 'fruit', 'grain', 'pulse', 'spice', 'byproduct', 'equipment', 'tractor', 'tool', 'other']
    },
    quantity: {
      type: Number,
      required: true
    },
    unit: String,
    pricePerUnit: Number,
    moq: Number,
    availableFrom: Date,
    location: String,
    photos: [String],
    isOrganic: Boolean,
    certifications: [String],
    transactionType: {
      type: String,
      enum: ['buy', 'rent'],
      default: 'buy'
    },
    rentalPeriod: {
      type: String,
      enum: ['day', 'week', 'month']
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold', 'rented'],
      default: 'available'
    },
    inquiries: [{
      buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      quantity: Number,
      message: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  { timestamps: true }
)

marketListingSchema.index({ seller: 1 })
marketListingSchema.index({ status: 1 })
marketListingSchema.index({ category: 1 })

export default mongoose.model('MarketListing', marketListingSchema)
