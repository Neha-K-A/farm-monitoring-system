import mongoose from 'mongoose'

const soilRecordSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true
    },
    testDate: {
      type: Date,
      default: Date.now
    },
    pH: Number,
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    organicMatter: Number,
    moisture: Number,
    texture: String,
    recommendations: [String],
    labReport: String
  },
  { timestamps: true }
)

soilRecordSchema.index({ farm: 1 })
soilRecordSchema.index({ testDate: 1 })

export default mongoose.model('SoilRecord', soilRecordSchema)
