import mongoose from 'mongoose'

const waterUsageSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true
    },
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop'
    },
    date: {
      type: Date,
      default: Date.now
    },
    waterUsed: Number,
    irrigationMethod: String,
    duration: Number,
    source: String,
    notes: String,
    monthlyTarget: Number
  },
  { timestamps: true }
)

waterUsageSchema.index({ farm: 1 })
waterUsageSchema.index({ date: 1 })

export default mongoose.model('WaterUsage', waterUsageSchema)
