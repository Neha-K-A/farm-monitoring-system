import mongoose from 'mongoose'

const weatherLogSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true
    },
    recordedAt: {
      type: Date,
      default: Date.now
    },
    temperature: Number,
    humidity: Number,
    rainfall: Number,
    windSpeed: Number,
    uvIndex: Number,
    condition: String,
    forecast: [{
      date: Date,
      condition: String,
      maxTemp: Number,
      minTemp: Number,
      rainChance: Number
    }],
    plantingRecommendation: String,
    alerts: [String],
    source: {
      type: String,
      default: 'openweather'
    }
  },
  { timestamps: true }
)

weatherLogSchema.index({ farm: 1 })
weatherLogSchema.index({ recordedAt: 1 })

export default mongoose.model('WeatherLog', weatherLogSchema)
