import mongoose from 'mongoose'

const healthLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    workHours: Number,
    heatExposure: {
      duration: Number,
      uvIndex: Number,
      temperature: Number
    },
    physicalActivity: String,
    waterIntake: Number,
    mood: {
      type: String,
      enum: ['good','average','fatigued','unwell']
    },
    symptoms: [String],
    alerts: [String],
    healthTips: [String],
    menstrualCycle: {
      phase: String,
      notes: String
    }
  },
  { timestamps: true }
)

healthLogSchema.index({ user: 1 })
healthLogSchema.index({ date: 1 })

export default mongoose.model('HealthLog', healthLogSchema)
