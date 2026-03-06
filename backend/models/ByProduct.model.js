import mongoose from 'mongoose'

const byProductSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sourceCrop: String,
    byProductName: String,
    description: String,
    usages: [String],
    quantity: Number,
    unit: String,
    pricePerUnit: Number,
    photos: [String],
    status: {
      type: String,
      enum: ['available','sold'],
      default: 'available'
    }
  },
  { timestamps: true }
)

byProductSchema.index({ owner: 1 })
byProductSchema.index({ status: 1 })

export default mongoose.model('ByProduct', byProductSchema)
