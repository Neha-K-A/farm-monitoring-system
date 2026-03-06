import mongoose from 'mongoose'

const cropSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    cropName: {
      type: String,
      required: true
    },
    cropVariety: String,
    cropType: {
      type: String,
      enum: ['vegetable','fruit','grain','pulse','spice','cash_crop','fodder','flower']
    },
    plantingDate: {
      type: Date,
      required: true
    },
    expectedHarvestDate: Date,
    actualHarvestDate: Date,
    areaPlanted: Number,
    seedQuantity: {
      amount: Number,
      unit: String
    },
    status: {
      type: String,
      enum: ['planted','growing','ready_to_harvest','harvested','failed'],
      default: 'planted'
    },
    yieldEstimate: {
      quantity: Number,
      unit: String
    },
    actualYield: {
      quantity: Number,
      unit: String
    },
    growthStages: [{
      stageName: String,
      startDate: Date,
      endDate: Date,
      notes: String,
      photoUrl: String
    }],
    inputs: [{
      inputType: {
        type: String,
        enum: ['fertilizer','pesticide','water','labor','seed','equipment','other']
      },
      name: String,
      quantity: Number,
      unit: String,
      costPerUnit: Number,
      totalCost: Number,
      dateApplied: Date
    }],
    diseaseHistory: [{
      diseaseName: String,
      detectedOn: Date,
      severity: {
        type: String,
        enum: ['low','medium','high']
      },
      treatment: String,
      resolvedOn: Date,
      photoUrl: String
    }],
    marketPrice: Number
  },
  { timestamps: true }
)

cropSchema.index({ owner: 1 })
cropSchema.index({ farm: 1 })
cropSchema.index({ status: 1 })
cropSchema.index({ expectedHarvestDate: 1 })

export default mongoose.model('Crop', cropSchema)
