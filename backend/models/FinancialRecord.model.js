import mongoose from 'mongoose'

const financialRecordSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm'
    },
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop'
    },
    type: {
      type: String,
      enum: ['income','expense','loan','subsidy','repayment'],
      required: true
    },
    category: String,
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount must be positive']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    description: String,
    date: {
      type: Date,
      default: Date.now
    },
    // Transaction status for timeline animation
    status: {
      type: String,
      enum: ['initiated', 'processing', 'approved', 'transferred', 'credited'],
      default: 'initiated'
    },
    // Timeline tracking for each status
    timeline: {
      initiated: { type: Date, default: Date.now },
      processing: Date,
      approved: Date,
      transferred: Date,
      credited: Date
    },
    bankTransaction: {
      bankName: String,
      accountNumber: String,
      transactionId: String,
      transactionType: String,
      referenceNumber: String,
      remarks: String
    },
    // For subsidy tracking
    schemeRelated: {
      schemeId: mongoose.Schema.Types.ObjectId,
      subsidyPercentage: Number,
      subsidyAmount: Number
    },
    profitMargin: Number
  },
  { timestamps: true }
)

financialRecordSchema.index({ owner: 1 })
financialRecordSchema.index({ farm: 1 })
financialRecordSchema.index({ date: 1 })
financialRecordSchema.index({ type: 1 })

export default mongoose.model('FinancialRecord', financialRecordSchema)
