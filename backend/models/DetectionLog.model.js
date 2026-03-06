import mongoose from 'mongoose'

const detectionLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm'
    },
    sessionId: {
      type: String,
      required: true
    },
    detectedClass: String,
    confidence: Number,
    timestamp: {
      type: Date,
      default: Date.now
    },
    action: String,
    condition: String,
    treatmentSuggested: String,
    prevention: String,
    cropAffected: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop'
    }
  },
  { timestamps: true }
)

detectionLogSchema.index({ user: 1 })
detectionLogSchema.index({ sessionId: 1 })
detectionLogSchema.index({ timestamp: 1 })

export default mongoose.model('DetectionLog', detectionLogSchema)
