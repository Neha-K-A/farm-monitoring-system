import mongoose from 'mongoose'

const distributorSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    email: String,
    businessName: String,
    location: {
      district: String,
      state: String,
      pincode: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    commodities: [String],
    rating: {
      type: Number,
      min: 0,
      max: 5
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

distributorSchema.index({ 'location.state': 1 })
distributorSchema.index({ 'location.district': 1 })

export default mongoose.model('Distributor', distributorSchema)
