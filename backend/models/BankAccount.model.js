import mongoose from 'mongoose'

const bankAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    ifscCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    accountHolderName: {
      type: String,
      required: true,
      trim: true,
    },
    accountType: {
      type: String,
      enum: ['savings', 'current'],
      default: 'savings',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastVerification: {
      type: Date,
    },
    metadata: {
      branchName: String,
      state: String,
      city: String,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
bankAccountSchema.index({ user: 1, isActive: 1 })

const BankAccount = mongoose.model('BankAccount', bankAccountSchema)

export default BankAccount
