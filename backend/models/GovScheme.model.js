import mongoose from 'mongoose'

const govSchemeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    schemeName: String, // Kept for backward compat
    department: String,
    state: {
      type: String,
      default: 'all'
    },
    description: String,
    eligibility: [String],
    benefits: String,
    subsidyAmount: {
      type: Number,
      default: 0
    },
    applicationProcess: String,
    documents: [String],
    deadline: Date,
    officialLink: String,
    link: String, // Kept for backward compat
    category: {
      type: String,
      enum: ['subsidy', 'loan', 'insurance', 'training', 'equipment', 'other']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

govSchemeSchema.index({ state: 1 })
govSchemeSchema.index({ category: 1 })
govSchemeSchema.index({ isActive: 1 })

export default mongoose.model('GovScheme', govSchemeSchema)
