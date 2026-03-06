import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      unique: true
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ['farmer', 'admin', 'distributor'],
      default: 'farmer'
    },
    language: {
      type: String,
      default: 'en'
    },
    location: {
      state: String,
      district: String,
      village: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    profilePhoto: String,
    isActive: {
      type: Boolean,
      default: true
    },
    healthProfile: {
      age: Number,
      weight: Number,
      height: Number,
      bloodGroup: String,
      hasChronicCondition: Boolean,
      notes: String
    },
    farmPreferences: {
      farmSize: String,
      cropTypes: [String],
      soilType: String
    },
    notifications: {
      weatherAlerts: { type: Boolean, default: true },
      diseaseAlerts: { type: Boolean, default: true },
      marketAlerts: { type: Boolean, default: false }
    },
    aiPreferences: {
      language: { type: String, default: 'en' },
      adviceLevel: { type: String, enum: ['basic', 'detailed'], default: 'basic' }
    },
    refreshToken: {
      type: String,
      select: false
    }
  },
  { timestamps: true }
)

// Indexes are defined via field options (unique/sparse) above.
// Avoid duplicate schema.index declarations for the same fields.

export default mongoose.model('User', userSchema)
